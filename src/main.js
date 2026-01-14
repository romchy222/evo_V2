// Main application entry point

let lastFrameTime = TimeUtils.now();
let gameLoopId = null;
let tickAccumulator = 0;
let lastUiUpdate = 0;

/**
 * Main game loop
 */
function gameLoop() {
    const now = TimeUtils.now();
    const deltaTime = Math.min(now - lastFrameTime, 100); // Cap at 100ms
    lastFrameTime = now;
    
    tickAccumulator += deltaTime;
    const tickInterval = CONFIG.GAME.TICK_INTERVAL;
    let tickCount = 0;
    while (tickAccumulator >= tickInterval && tickCount < 5) {
        GameState.update(tickInterval);
        tickAccumulator -= tickInterval;
        tickCount++;
    }
    
    // Update UI
    if (now - lastUiUpdate > CONFIG.GAME.UI_UPDATE_INTERVAL) {
        Views.renderHeader();
        lastUiUpdate = now;
    }
    
    // Auto-save periodically
    if (now - UI.lastSaveTime > CONFIG.AUTO_SAVE_INTERVAL) {
        UI.saveGame();
    }
    
    if (!GameState.isPaused && now - GameState.sessionStart > CONFIG.AD.interstitialMinActive) {
        if (!GameState.nextInterstitialAt) {
            GameState.nextInterstitialAt = now + CONFIG.AD.interstitialCooldown;
        }
        if (now > GameState.nextInterstitialAt) {
            YandexSDKManager.showInterstitial();
            GameState.nextInterstitialAt = now + CONFIG.AD.interstitialCooldown;
        }
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

/**
 * Initialize the game
 */
async function initGame() {
    logDebug('Starting game initialization...');
    
    // Load language
    i18n.loadLanguage();
    i18n.updatePageText();
    
    // Initialize audio
    AudioUtils.init();
    
    // Initialize SDK
    await YandexSDKManager.init();
    
    // Load game state
    let saveData = SaveSystem.loadLocal();
    
    // Try to load from cloud
    const cloudData = await SaveSystem.loadCloud();
    if (cloudData) {
        saveData = SaveSystem.merge(saveData, cloudData);
    }
    
    GameState.init(saveData);
    
    // Restore audio setting
    AudioUtils.isEnabled = GameState.soundEnabled;
    AudioUtils.setVolume(GameState.soundVolume ?? 1);
    
    // Check for offline income
    const offlineData = GameState.handleOfflineIncome();
    if (offlineData && offlineData.earned > 0) {
        // Show notification after UI is ready
        setTimeout(() => {
            Views.showOfflineNotification(offlineData);
        }, 500);
    }
    
    // Initialize systems
    StatsSystem.init(GameState);
    QuestSystem.init(GameState);
    
    // Initialize UI
    UI.init();
    
    // Start game loop
    lastFrameTime = TimeUtils.now();
    gameLoopId = requestAnimationFrame(gameLoop);
    
    logDebug('Game initialized and running');
}

/**
 * Cleanup on unload
 */
function cleanup() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    UI.saveGame();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Cleanup on unload
window.addEventListener('beforeunload', cleanup);
window.addEventListener('unload', cleanup);
window.addEventListener('error', (event) => {
    logError('Global error:', event.message || event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled rejection:', event.reason);
});
