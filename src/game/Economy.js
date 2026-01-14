// Economy calculations and formulas

const Economy = {
    /**
     * Calculate cost for next upgrade level
     */
    calculateCost(level, basePrice, multiplier) {
        return Math.floor(basePrice * Math.pow(multiplier, level));
    },

    /**
     * Calculate total cost for bulk purchase
     */
    calculateBulkCost(amount, currentLevel, basePrice, multiplier) {
        let total = 0;
        for (let i = 0; i < amount; i++) {
            total += this.calculateCost(currentLevel + i, basePrice, multiplier);
        }
        return Math.floor(total);
    },

    /**
     * Calculate maximum affordable amount
     */
    calculateMaxAffordable(energy, currentLevel, basePrice, multiplier, limit = 500) {
        let count = 0;
        let remaining = energy;
        while (count < limit) {
            const cost = this.calculateCost(currentLevel + count, basePrice, multiplier);
            if (remaining < cost) break;
            remaining -= cost;
            count++;
        }
        return count;
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
