// Yandex Games SDK Manager - wrapper for Yandex SDK with stub fallback

const YandexSDKManager = {
    isReady: false,
    isLoggedIn: false,
    isLocalStub: true,
    sdkInstance: null,
    playerData: null,
    sdkLoadPromise: null,
    
    /**
     * Detect if we are running on Yandex Games domain
     */
    isYandexPlatform() {
        const host = window.location.hostname || '';
        return host.includes('yandex') || host.includes('games');
    },
    
    /**
     * Ensure SDK script is loaded (waits for window.YaGames)
     */
    async ensureSDKLoaded() {
        if (typeof window.YaGames !== 'undefined') {
            return true;
        }
        
        // If <script src="/sdk.js"> already on page, wait for it
        const existing = document.querySelector('script[src="/sdk.js"]');
        if (existing) {
            const loaded = await new Promise((resolve) => {
                if (typeof window.YaGames !== 'undefined') return resolve(true);
                existing.addEventListener('load', () => resolve(true), { once: true });
                existing.addEventListener('error', () => resolve(false), { once: true });
                setTimeout(() => resolve(typeof window.YaGames !== 'undefined'), 5000);
            });
            return loaded;
        }
        
        if (!this.sdkLoadPromise) {
            this.sdkLoadPromise = new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = '/sdk.js'; // relative path for Yandex zip upload
                script.async = true;
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.head.appendChild(script);
            });
        }
        
        const loaded = await Promise.race([
            this.sdkLoadPromise,
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        
        if (!loaded) return false;
        
        // Wait for global to appear
        for (let i = 0; i < 20; i++) {
            if (typeof window.YaGames !== 'undefined') {
                return true;
            }
            await new Promise(r => setTimeout(r, 100));
        }
        
        return typeof window.YaGames !== 'undefined';
    },
    
    /**
     * Initialize SDK
     */
    async init() {
        logDebug('Initializing Yandex SDK...');
        
        try {
            // Use real SDK only on Yandex platform
            if (this.isYandexPlatform()) {
                const sdkAvailable = await this.ensureSDKLoaded();
                
                if (!sdkAvailable || typeof window.YaGames === 'undefined') {
                    logDebug('Yandex SDK script not ready, using local stub');
                    this.useLocalStub();
                    // Continue with stub mode
                }
                
                try {
                    const ysdk = await window.YaGames.init({});
                    this.sdkInstance = ysdk;
                    this.isReady = true;
                    this.isLocalStub = false;
                    
                    // Try to get player
                    try {
                        const player = await ysdk.getPlayer();
                        if (player) {
                            this.playerData = player;
                            this.isLoggedIn = true;
                            logDebug('SDK initialized successfully, player:', player);
                        }
                    } catch (e) {
                        logDebug('Player not available:', e);
                    }
                } catch (e) {
                    logError('Failed to initialize SDK:', e);
                    this.useLocalStub();
                }
            } else {
                logDebug('Yandex SDK not found, using local stub');
                this.useLocalStub();
            }
        } catch (e) {
            logError('SDK initialization error:', e);
            this.useLocalStub();
        }
        
        // Expose for other systems (SaveSystem expects window.YandexSDK)
        window.YandexSDK = this;
    },
    
    /**
     * Use local stub (for development/offline)
     */
    useLocalStub() {
        this.isReady = true;
        this.isLocalStub = true;
        logDebug('Using local stub for SDK');
    },
    
    /**
     * Get player data
     */
    async getPlayerData() {
        if (this.isLocalStub) {
            return StorageUtils.getLocal('sdk_player_data') || {};
        }
        
        try {
            if (!this.sdkInstance) return {};
            
            const player = await this.sdkInstance.getPlayer();
            if (!player) return {};
            
            const data = await player.getData(['gameState']);
            return data.gameState || {};
        } catch (e) {
            logError('Failed to get player data:', e);
            return {};
        }
    },
    
    /**
     * Set player data
     */
    async setPlayerData(data) {
        if (this.isLocalStub) {
            StorageUtils.setLocal('sdk_player_data', data);
            return true;
        }
        
        try {
            if (!this.sdkInstance) return false;
            
            const player = await this.sdkInstance.getPlayer();
            if (!player) return false;
            
            await player.setData({ gameState: data }, true);
            return true;
        } catch (e) {
            logError('Failed to set player data:', e);
            return false;
        }
    },
    
    /**
     * Show interstitial ad
     */
    async showInterstitial() {
        // Check cooldown
        const now = TimeUtils.now();
        if (now - GameState.lastAdInterstitial < CONFIG.AD.interstitialCooldown) {
            logDebug('Interstitial on cooldown');
            return false;
        }
        
        logDebug('Showing interstitial ad...');
        
        GameState.pause();
        
        try {
            if (this.isLocalStub) {
                // Simulate ad view
                await this.simulateAdView();
            } else if (this.sdkInstance) {
                await this.sdkInstance.adv.showInterstitial();
            }
            
            GameState.lastAdInterstitial = now;
            GameState.resume();
            return true;
        } catch (e) {
            logError('Interstitial error:', e);
            GameState.resume();
            return false;
        }
    },
    
    /**
     * Show rewarded ad
     */
    async showRewarded() {
        logDebug('Showing rewarded ad...');
        
        GameState.pause();
        
        try {
            if (this.isLocalStub) {
                // Simulate ad view and reward
                await this.simulateRewardedView();
                GameState.resume();
                return { success: true };
            } else if (this.sdkInstance) {
                await this.sdkInstance.adv.showRewardedVideo({
                    onOpen: () => {
                        logDebug('Ad opened');
                    },
                    onRewarded: () => {
                        logDebug('Ad rewarded');
                        GameState.resume();
                        return { success: true };
                    },
                    onClose: () => {
                        logDebug('Ad closed');
                        GameState.resume();
                        return { success: false };
                    },
                    onError: (error) => {
                        logError('Ad error:', error);
                        GameState.resume();
                        return { success: false };
                    }
                });
            }
        } catch (e) {
            logError('Rewarded ad error:', e);
            GameState.resume();
            return { success: false };
        }
    },
    
    /**
     * Submit score to leaderboard
     */
    async submitScore(score) {
        if (CONFIG.LEADERBOARD.id === 'score1234') {
            logDebug('Leaderboard ID not configured, skipping submit');
            return false;
        }
        
        logDebug('Submitting score:', score);
        
        try {
            if (this.isLocalStub) {
                // Store locally
                let scores = StorageUtils.getLocal('leaderboard_scores') || [];
                scores.push({
                    name: 'Player',
                    score: score,
                    time: TimeUtils.now()
                });
                StorageUtils.setLocal('leaderboard_scores', scores);
                return true;
            } else if (this.sdkInstance) {
                const lbk = await this.sdkInstance.getLeaderboards();
                await lbk.setLeaderboardScore(CONFIG.LEADERBOARD.id, score);
                return true;
            }
        } catch (e) {
            logError('Failed to submit score:', e);
            return false;
        }
    },
    
    /**
     * Get leaderboard entries
     */
    async getLeaderboardEntries(topCount = 10) {
        logDebug('Getting leaderboard entries...');
        
        try {
            if (this.isLocalStub) {
                // Return local scores
                const scores = StorageUtils.getLocal('leaderboard_scores') || [];
                return scores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, topCount)
                    .map((entry, idx) => ({
                        rank: idx + 1,
                        name: entry.name,
                        score: entry.score
                    }));
            } else if (this.sdkInstance) {
                const lbk = await this.sdkInstance.getLeaderboards();
                const entries = await lbk.getLeaderboardEntries(CONFIG.LEADERBOARD.id, { quantityTop: topCount });
                return entries.map((entry, idx) => ({
                    rank: idx + 1,
                    name: entry.player?.publicName || 'Anonymous',
                    score: entry.score
                }));
            }
        } catch (e) {
            logError('Failed to get leaderboard:', e);
            return [];
        }
    },
    
    /**
     * Simulate ad view (for local testing)
     */
    simulateAdView() {
        return new Promise((resolve) => {
            setTimeout(() => {
                logDebug('Simulated ad view completed');
                resolve();
            }, 1500);
        });
    },
    
    /**
     * Simulate rewarded ad view (for local testing)
     */
    simulateRewardedView() {
        return new Promise((resolve) => {
            setTimeout(() => {
                logDebug('Simulated rewarded ad view completed');
                resolve();
            }, 1500);
        });
    },
    
    /**
     * Pause game for ad
     */
    pauseGame() {
        GameState.pause();
    },
    
    /**
     * Resume game after ad
     */
    resumeGame() {
        GameState.resume();
    }
};
