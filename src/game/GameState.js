// Main game state and logic

const GameState = {
    // Core state
    energy: 0,
    totalEarned: 0,
    clickPower: CONFIG.INITIAL_CLICK_POWER,
    eps: CONFIG.INITIAL_EPS,
    
    // Upgrades
    upgrades: {
        clickPower: 0,
        eps: 0,
        multiplier: 0
    },
    
    // Shop items (generators)
    shopItems: {},
    
    // Prestige
    prestigeCount: 0,
    prestigePoints: 0,
    
    // Settings
    soundEnabled: true,
    language: CONFIG.DEFAULT_LANGUAGE,
    
    // Game state
    isPaused: false,
    isOffline: false,
    
    // Timestamps
    lastSave: TimeUtils.now(),
    lastActive: TimeUtils.now(),
    lastAdInterstitial: 0,
    lastAdRewarded: 0,
    offlineMultiplierEnd: 0,
    
    // UI state
    achievements: [],
    tutorialCompleted: false,
    tutorialStep: 0,
    
    /**
     * Initialize game from save
     */
    init(saveData) {
        Object.assign(this, saveData);
        StatsSystem.init(this);
        QuestSystem.init(this);
        AchievementSystem.checkNewAchievements(this);
        logDebug('Game state initialized');
    },
    
    /**
     * Handle click action
     */
    click() {
        if (this.isPaused) return;
        
        // Запись клика в статистику
        StatsSystem.recordClick(this);
        
        // Обновить комбо
        PowerUpSystem.updateCombo(this);
        
        let gain = this.clickPower * (1 + (this.upgrades.multiplier * 0.05));
        
        // Применить множители power-ups
        const powerUpMultiplier = PowerUpSystem.getMultiplier(this);
        const comboMultiplier = PowerUpSystem.getComboMultiplier();
        
        gain *= powerUpMultiplier * comboMultiplier;
        
        this.energy += gain;
        this.totalEarned += gain;
        
        AudioUtils.init();
        AudioUtils.playClick();
        
        return gain;
    },
    
    /**
     * Update passive income
     */
    update(deltaTime) {
        if (this.isPaused) return;
        
        // Обновить power-ups
        PowerUpSystem.updatePowerUps(this);
        
        const prestigeMultiplier = Economy.calculatePrestigeMultiplier(this.prestigeCount);
        const totalEPS = this.eps * prestigeMultiplier;
        
        // Check for rewarded ad multiplier
        if (this.offlineMultiplierEnd > TimeUtils.now()) {
            // Apply multiplier
            const gain = (totalEPS * CONFIG.AD.rewardedBonus.multiplier * deltaTime) / 1000;
            this.energy += gain;
            this.totalEarned += gain;
        } else {
            const gain = (totalEPS * deltaTime) / 1000;
            this.energy += gain;
            this.totalEarned += gain;
        }
        
        // Обновить статистику
        StatsSystem.updateCPS(this);
        StatsSystem.recordHistory(this);
        
        // Обновить квесты
        QuestSystem.updateProgress(this, 'energy', this.energy);
        QuestSystem.updateProgress(this, 'eps', this.eps);
        
        // Проверить новые ачивки
        const newAchievements = AchievementSystem.checkNewAchievements(this);
        if (newAchievements.length > 0) {
            newAchievements.forEach(ach => {
                this.energy += ach.reward;
                this.totalEarned += ach.reward;
            });
        }
    },
    
    /**
     * Buy an upgrade
     */
    buyUpgrade(upgradeType) {
        if (this.isPaused) return false;
        
        const config = Economy.getUpgradeConfig(upgradeType);
        if (!config) return false;
        
        const level = this.upgrades[upgradeType];
        const cost = Economy.calculateCost(level, config.basePrice, config.priceMultiplier);
        
        if (this.energy < cost) return false;
        
        this.energy -= cost;
        this.upgrades[upgradeType]++;
        
        // Обновить квесты
        QuestSystem.updateProgress(this, 'upgrades', 
            (this.upgrades.clickPower || 0) + 
            (this.upgrades.eps || 0) + 
            (this.upgrades.multiplier || 0)
        );
        
        // Update stats
        this.updateStats();
        
        AudioUtils.init();
        AudioUtils.playSuccess();
        
        return true;
    },
    
    /**
     * Buy a shop item (generator)
     */
    buyShopItem(itemId) {
        if (this.isPaused) return false;
        
        const item = CONFIG.SHOP_ITEMS[itemId];
        if (!item) return false;
        
        if (!this.shopItems) this.shopItems = {};
        const count = this.shopItems[itemId] || 0;
        const cost = item.basePrice * Math.pow(item.priceMultiplier, count);
        
        if (this.energy < cost) return false;
        
        this.energy -= cost;
        this.shopItems[itemId] = count + 1;
        
        // Add income from shop item
        const income = item.baseIncome * Math.pow(item.effectMultiplier, count);
        this.eps += income;
        
        AudioUtils.init();
        AudioUtils.playSuccess();
        
        return true;
    },
    
    /**
     * Recalculate derived stats
     */
    updateStats() {
        // Recalculate click power
        const clickConfig = Economy.getUpgradeConfig('clickPower');
        this.clickPower = CONFIG.INITIAL_CLICK_POWER + 
                         Economy.calculateEffect(this.upgrades.clickPower, 
                                               clickConfig.baseEffect, 
                                               clickConfig.effectMultiplier);
        
        // Recalculate EPS
        const epsConfig = Economy.getUpgradeConfig('eps');
        this.eps = CONFIG.INITIAL_EPS + 
                  Economy.calculateEffect(this.upgrades.eps, 
                                        epsConfig.baseEffect, 
                                        epsConfig.effectMultiplier);
    },
    
    /**
     * Check if can prestige
     */
    canPrestige() {
        const threshold = Economy.calculatePrestigeThreshold(this.prestigeCount);
        return this.totalEarned >= threshold;
    },
    
    /**
     * Get prestige points available
     */
    getAvailablePrestigePoints() {
        const threshold = Economy.calculatePrestigeThreshold(this.prestigeCount);
        return Economy.calculatePrestigePoints(this.totalEarned, threshold);
    },
    
    /**
     * Execute prestige
     */
    prestige() {
        const newPoints = this.getAvailablePrestigePoints();
        
        this.prestigeCount++;
        this.prestigePoints += newPoints;
        
        // Reset progress
        this.energy = 0;
        this.totalEarned = 0;
        this.upgrades = { clickPower: 0, eps: 0, multiplier: 0 };
        this.updateStats();
        
        AudioUtils.init();
        AudioUtils.playSuccess();
        
        logDebug(`Prestiged! Count: ${this.prestigeCount}, Points: ${this.prestigePoints}`);
        
        return newPoints;
    },
    
    /**
     * Apply rewarded ad bonus
     */
    applyAdBonus() {
        this.offlineMultiplierEnd = TimeUtils.now() + CONFIG.AD.rewardedBonus.duration;
        AudioUtils.playSuccess();
    },
    
    /**
     * Pause game
     */
    pause() {
        this.isPaused = true;
        logDebug('Game paused');
    },
    
    /**
     * Resume game
     */
    resume() {
        this.isPaused = false;
        logDebug('Game resumed');
    },
    
    /**
     * Check and handle offline income
     */
    handleOfflineIncome() {
        const now = TimeUtils.now();
        const offlineTime = now - this.lastActive;
        
        if (offlineTime > 5000) { // More than 5 seconds offline
            const prestigeMultiplier = Economy.calculatePrestigeMultiplier(this.prestigeCount);
            const totalEPS = this.eps * prestigeMultiplier;
            const offlineIncome = Economy.calculateOfflineIncome(totalEPS, offlineTime);
            
            if (offlineIncome > 0) {
                this.energy += offlineIncome;
                this.totalEarned += offlineIncome;
                this.isOffline = true;
                return {
                    earned: offlineIncome,
                    time: offlineTime
                };
            }
        }
        
        return null;
    },
    
    /**
     * Reset all progress
     */
    reset() {
        const newState = SaveSystem.createDefault();
        Object.assign(this, newState);
        logDebug('Game state reset');
    },
    
    /**
     * Serialize state for saving
     */
    serialize() {
        return {
            energy: this.energy,
            totalEarned: this.totalEarned,
            clickPower: this.clickPower,
            eps: this.eps,
            upgrades: { ...this.upgrades },
            shopItems: { ...this.shopItems },
            prestigeCount: this.prestigeCount,
            prestigePoints: this.prestigePoints,
            soundEnabled: this.soundEnabled,
            language: this.language,
            lastSave: TimeUtils.now(),
            lastActive: this.lastActive,
            lastAdInterstitial: this.lastAdInterstitial,
            lastAdRewarded: this.lastAdRewarded,
            achievements: this.achievements,
            tutorialCompleted: this.tutorialCompleted,
            tutorialStep: this.tutorialStep
        };
    }
};
