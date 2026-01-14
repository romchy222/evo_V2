// Система достижений (Achievements)

const AchievementSystem = {
    achievements: [
        {
            id: 'first_click',
            name: 'achievements.firstClick',
            desc: 'achievements.firstClickDesc',
            icon: '👆',
            condition: (stats) => stats.totalClicks >= 1,
            reward: 100
        },
        {
            id: 'hundred_clicks',
            name: 'achievements.hundredClicks',
            desc: 'achievements.hundredClicksDesc',
            icon: '💯',
            condition: (stats) => stats.totalClicks >= 100,
            reward: 500
        },
        {
            id: 'thousand_clicks',
            name: 'achievements.thousandClicks',
            desc: 'achievements.thousandClicksDesc',
            icon: '🎯',
            condition: (stats) => stats.totalClicks >= 1000,
            reward: 1000
        },
        {
            id: 'millionaire',
            name: 'achievements.millionaire',
            desc: 'achievements.millionaireDesc',
            icon: '💰',
            condition: (stats) => stats.totalEarned >= 1e6,
            reward: 5000
        },
        {
            id: 'billionaire',
            name: 'achievements.billionaire',
            desc: 'achievements.billionaireDesc',
            icon: '🤑',
            condition: (stats) => stats.totalEarned >= 1e9,
            reward: 10000
        },
        {
            id: 'first_prestige',
            name: 'achievements.firstPrestige',
            desc: 'achievements.firstPrestigeDesc',
            icon: '✨',
            condition: (stats) => stats.prestigeCount >= 1,
            reward: 2000
        },
        {
            id: 'triple_prestige',
            name: 'achievements.triplePrestige',
            desc: 'achievements.triplePrestigeDesc',
            icon: '⭐',
            condition: (stats) => stats.prestigeCount >= 3,
            reward: 5000
        },
        {
            id: 'speedy_clicker',
            name: 'achievements.speedyClicker',
            desc: 'achievements.speedyClickerDesc',
            icon: '⚡',
            condition: (stats) => stats.maxClicksPerSecond >= 10,
            reward: 1000
        },
        {
            id: 'passive_master',
            name: 'achievements.passiveMaster',
            desc: 'achievements.passiveMasterDesc',
            icon: '🔄',
            condition: (stats) => stats.eps >= 1000,
            reward: 3000
        },
        {
            id: 'ten_upgrades',
            name: 'achievements.tenUpgrades',
            desc: 'achievements.tenUpgradesDesc',
            icon: '📈',
            condition: (stats) => {
                const total = (stats.upgradesCClickPower || 0) + 
                            (stats.upgradesEps || 0) + 
                            (stats.upgradesMultiplier || 0);
                return total >= 10;
            },
            reward: 2000
        }
    ],
    
    /**
     * Проверить, разблокирвалось ли новое достижение
     */
    checkNewAchievements(gameState) {
        const stats = {
            totalClicks: gameState.totalClicks || 0,
            totalEarned: gameState.totalEarned,
            prestigeCount: gameState.prestigeCount,
            eps: gameState.eps,
            maxClicksPerSecond: gameState.maxClicksPerSecond || 0,
            upgradesCClickPower: gameState.upgrades.clickPower,
            upgradesEps: gameState.upgrades.eps,
            upgradesMultiplier: gameState.upgrades.multiplier
        };
        
        const newAchievements = [];
        
        this.achievements.forEach(ach => {
            if (!gameState.achievements.includes(ach.id) && ach.condition(stats)) {
                gameState.achievements.push(ach.id);
                newAchievements.push(ach);
            }
        });
        
        return newAchievements;
    },
    
    /**
     * Получить все разблокированные достижения
     */
    getUnlocked(gameState) {
        return this.achievements.filter(ach => gameState.achievements.includes(ach.id));
    },
    
    /**
     * Получить заблокированные достижения
     */
    getLocked(gameState) {
        return this.achievements.filter(ach => !gameState.achievements.includes(ach.id));
    },
    
    /**
     * Получить прогресс разблокировки
     */
    getProgress(gameState) {
        const unlocked = this.getUnlocked(gameState).length;
        const total = this.achievements.length;
        return { unlocked, total, percent: Math.round((unlocked / total) * 100) };
    }
};
