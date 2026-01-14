// Save system - handles local storage and cloud sync

const SaveSystem = {
    STORAGE_KEY: 'orbit_clicker_save',
    
    /**
     * Create default save data
     */
    createDefault() {
        return {
            version: CONFIG.SAVE_VERSION,
            energy: 0,
            totalEarned: 0,
            clickPower: CONFIG.INITIAL_CLICK_POWER,
            eps: CONFIG.INITIAL_EPS,
            
            // Upgrade levels
            upgrades: {
                clickPower: 0,
                eps: 0,
                multiplier: 0
            },
            
            // Prestige
            prestigeCount: 0,
            prestigePoints: 0,
            
            // Settings
            soundEnabled: true,
            language: CONFIG.DEFAULT_LANGUAGE,
            
            // Timestamps
            lastSave: TimeUtils.now(),
            lastActive: TimeUtils.now(),
            lastAdInterstitial: 0,
            lastAdRewarded: 0,
            
            // Achievements
            achievements: [],
            
            // Tutorial
            tutorialCompleted: false,
            tutorialStep: 0
        };
    },
    
    /**
     * Validate save data
     */
    validate(data) {
        if (!data || typeof data !== 'object') return false;
        if (data.version !== CONFIG.SAVE_VERSION) return false;
        
        // Check required fields
        const required = ['energy', 'totalEarned', 'clickPower', 'eps', 'upgrades'];
        return required.every(field => field in data);
    },
    
    /**
     * Migrate save data to new format if needed
     */
    migrate(data) {
        if (!data) return this.createDefault();
        
        // v1 to v2 migration example
        if (data.version === 1) {
            data.version = 2;
            if (!data.achievements) data.achievements = [];
            // Add other v2 fields
        }
        
        return data;
    },
    
    /**
     * Load from local storage
     */
    loadLocal() {
        try {
            const data = StorageUtils.getLocal(this.STORAGE_KEY);
            
            if (!data) {
                logDebug('No local save found');
                return this.createDefault();
            }
            
            if (!this.validate(data)) {
                logError('Invalid save data format');
                return this.createDefault();
            }
            
            const migrated = this.migrate(data);
            logDebug('Loaded local save');
            return migrated;
        } catch (e) {
            logError('Failed to load local save:', e);
            return this.createDefault();
        }
    },
    
    /**
     * Save to local storage
     */
    saveLocal(gameState) {
        try {
            const saveData = {
                version: CONFIG.SAVE_VERSION,
                energy: gameState.energy,
                totalEarned: gameState.totalEarned,
                clickPower: gameState.clickPower,
                eps: gameState.eps,
                upgrades: { ...gameState.upgrades },
                prestigeCount: gameState.prestigeCount,
                prestigePoints: gameState.prestigePoints,
                soundEnabled: gameState.soundEnabled,
                language: gameState.language,
                lastSave: TimeUtils.now(),
                lastActive: gameState.lastActive,
                lastAdInterstitial: gameState.lastAdInterstitial,
                lastAdRewarded: gameState.lastAdRewarded,
                achievements: gameState.achievements || [],
                tutorialCompleted: gameState.tutorialCompleted,
                tutorialStep: gameState.tutorialStep
            };
            
            StorageUtils.setLocal(this.STORAGE_KEY, saveData);
            logDebug('Saved to local storage');
            return true;
        } catch (e) {
            logError('Failed to save to local storage:', e);
            return false;
        }
    },
    
    /**
     * Load from cloud (async) - wrapper for SDK
     */
    async loadCloud() {
        try {
            if (!window.YandexSDK || !window.YandexSDK.isReady) {
                logDebug('Cloud not available');
                return null;
            }
            
            const data = await window.YandexSDK.getPlayerData();
            logDebug('Loaded from cloud:', data);
            return data;
        } catch (e) {
            logError('Failed to load from cloud:', e);
            return null;
        }
    },
    
    /**
     * Save to cloud (async) - wrapper for SDK
     */
    async saveCloud(gameState) {
        try {
            if (!window.YandexSDK || !window.YandexSDK.isReady) {
                logDebug('Cloud not available');
                return false;
            }
            
            const saveData = {
                version: CONFIG.SAVE_VERSION,
                energy: gameState.energy,
                totalEarned: gameState.totalEarned,
                clickPower: gameState.clickPower,
                eps: gameState.eps,
                upgrades: { ...gameState.upgrades },
                prestigeCount: gameState.prestigeCount,
                prestigePoints: gameState.prestigePoints,
                lastSave: TimeUtils.now()
            };
            
            await window.YandexSDK.setPlayerData(saveData);
            logDebug('Saved to cloud');
            return true;
        } catch (e) {
            logError('Failed to save to cloud:', e);
            return false;
        }
    },
    
    /**
     * Merge saves - choose the most recent one
     */
    merge(localSave, cloudSave) {
        if (!cloudSave) return localSave;
        if (!localSave) return cloudSave;
        
        const localTime = localSave.lastSave || 0;
        const cloudTime = cloudSave.lastSave || 0;
        
        if (cloudTime > localTime) {
            logDebug('Using cloud save (more recent)');
            return cloudSave;
        } else {
            logDebug('Using local save (more recent)');
            return localSave;
        }
    },
    
    /**
     * Delete all saves
     */
    deleteAll() {
        StorageUtils.removeLocal(this.STORAGE_KEY);
        logDebug('Deleted all local saves');
    }
};
