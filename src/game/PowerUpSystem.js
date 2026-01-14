// Система активных способностей и комбо

const PowerUpSystem = {
    powerUps: [
        {
            id: 'x2_income',
            name: 'powerUps.x2Income',
            desc: 'powerUps.x2IncomeDesc',
            icon: '⚡',
            duration: 30000,
            multiplier: 2,
            cost: 1000,
            active: false,
            endTime: 0
        },
        {
            id: 'x5_clicks',
            name: 'powerUps.x5Clicks',
            desc: 'powerUps.x5ClicksDesc',
            icon: '💥',
            duration: 20000,
            multiplier: 5,
            cost: 2000,
            active: false,
            endTime: 0,
            affectsClicks: true
        },
        {
            id: 'auto_clicker',
            name: 'powerUps.autoClicker',
            desc: 'powerUps.autoClickerDesc',
            icon: '🤖',
            duration: 15000,
            autoClicks: 10,
            cost: 1500,
            active: false,
            endTime: 0
        }
    ],
    
    // Система комбо
    comboData: {
        currentCombo: 0,
        maxCombo: 0,
        comboMultiplier: 1,
        lastComboTime: 0,
        comboTimeout: 5000 // 5 сек между кликами для комбо
    },
    
    /**
     * Активировать power-up
     */
    activatePowerUp(gameState, powerUpId) {
        if (!gameState.powerUps) {
            gameState.powerUps = [];
            this.powerUps.forEach(pu => {
                gameState.powerUps.push({ ...pu });
            });
        }
        
        const powerUp = gameState.powerUps.find(p => p.id === powerUpId);
        if (!powerUp || gameState.energy < powerUp.cost) return false;
        
        gameState.energy -= powerUp.cost;
        powerUp.active = true;
        powerUp.endTime = TimeUtils.now() + powerUp.duration;
        
        AudioUtils.init();
        AudioUtils.playSuccess();
        
        return true;
    },
    
    /**
     * Обновить активные power-ups
     */
    updatePowerUps(gameState) {
        if (!gameState.powerUps) return;
        
        const now = TimeUtils.now();
        gameState.powerUps.forEach(pu => {
            if (pu.active && now > pu.endTime) {
                pu.active = false;
            }
        });
    },
    
    /**
     * Получить текущий множитель от power-ups
     */
    getMultiplier(gameState) {
        if (!gameState.powerUps) return 1;
        
        let multiplier = 1;
        gameState.powerUps.forEach(pu => {
            if (pu.active && pu.multiplier) {
                multiplier *= pu.multiplier;
            }
        });
        
        return multiplier;
    },
    
    /**
     * Обновить комбо при клике
     */
    updateCombo(gameState) {
        const now = TimeUtils.now();
        
        if (now - this.comboData.lastComboTime < this.comboData.comboTimeout) {
            this.comboData.currentCombo++;
        } else {
            this.comboData.currentCombo = 1;
        }
        
        this.comboData.lastComboTime = now;
        this.comboData.maxCombo = Math.max(
            this.comboData.maxCombo,
            this.comboData.currentCombo
        );
        
        // Множитель за комбо: +10% за каждый стак (макс x2.0 при 10 комбо)
        this.comboData.comboMultiplier = 1 + Math.min(this.comboData.currentCombo, 10) * 0.1;
    },
    
    /**
     * Получить комбо множитель
     */
    getComboMultiplier() {
        // Проверить, не истекло ли время комбо
        if (TimeUtils.now() - this.comboData.lastComboTime > this.comboData.comboTimeout) {
            this.comboData.currentCombo = 0;
            this.comboData.comboMultiplier = 1;
        }
        
        return this.comboData.comboMultiplier;
    },
    
    /**
     * Получить данные о power-ups
     */
    getPowerUpsData(gameState) {
        if (!gameState.powerUps) {
            gameState.powerUps = [];
            this.powerUps.forEach(pu => {
                gameState.powerUps.push({ ...pu });
            });
        }
        
        return gameState.powerUps.map(pu => ({
            ...pu,
            timeRemaining: pu.active ? Math.max(0, pu.endTime - TimeUtils.now()) : 0
        }));
    }
};
