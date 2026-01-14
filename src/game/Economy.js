// Economy calculations and formulas

const Economy = {
    /**
     * Calculate cost for next upgrade level
     */
    calculateCost(level, basePrice, multiplier) {
        return Math.floor(basePrice * Math.pow(multiplier, level));
    },
    
    /**
     * Calculate upgrade effect for given level
     */
    calculateEffect(level, baseEffect, multiplier) {
        return baseEffect * Math.pow(multiplier, level);
    },
    
    /**
     * Calculate next prestige threshold
     */
    calculatePrestigeThreshold(prestigeCount) {
        return CONFIG.PRESTIGE.threshold * Math.pow(CONFIG.PRESTIGE.thresholdGrowth, prestigeCount);
    },
    
    /**
     * Calculate prestige points from earned energy
     */
    calculatePrestigePoints(totalEarned, threshold) {
        return CONFIG.PRESTIGE.pointsFormula(totalEarned, threshold);
    },
    
    /**
     * Calculate permanent income multiplier from prestige
     */
    calculatePrestigeMultiplier(prestigeCount) {
        return 1 + (prestigeCount * CONFIG.PRESTIGE.bonusPerPoint);
    },
    
    /**
     * Calculate total income including prestige bonus
     */
    calculateTotalEPS(baseEPS, prestigeMultiplier) {
        return baseEPS * prestigeMultiplier;
    },
    
    /**
     * Calculate offline income
     */
    calculateOfflineIncome(eps, timePassed) {
        const maxTime = CONFIG.OFFLINE_INCOME_LIMIT;
        const actualTime = Math.min(timePassed, maxTime);
        return (eps * actualTime) / 1000; // actualTime is in ms
    },
    
    /**
     * Get upgrade config by type
     */
    getUpgradeConfig(type) {
        return CONFIG.UPGRADES[type];
    }
};
