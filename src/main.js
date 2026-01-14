// Main application entry point

let lastFrameTime = TimeUtils.now();
let gameLoopId = null;

/**
 * Main game loop
 */
function gameLoop() {
    const now = TimeUtils.now();
    const deltaTime = Math.min(now - lastFrameTime, 100); // Cap at 100ms
    lastFrameTime = now;
    
    // Update game state
    GameState.update(deltaTime);
    
    // Update UI
    Views.renderHeader();
    
    // Auto-save periodically
    if (now - UI.lastSaveTime > CONFIG.AUTO_SAVE_INTERVAL) {
        UI.saveGame();
    }
    
    // Show interstitial ad occasionally (every 5 minutes of active play)
    if (!GameState.isPaused && now - GameState.lastAdInterstitial > 5 * 60 * 1000) {
        // Random chance to show ad
        if (Math.random() < 0.1) { // 10% chance per frame
            YandexSDKManager.showInterstitial();
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
