// Система квестов

const QuestSystem = {
    quests: [
        {
            id: 'click_50',
            name: 'quests.click50',
            desc: 'quests.click50Desc',
            icon: '👆',
            goal: 50,
            metric: 'clicks',
            reward: 500,
            rewardType: 'energy',
            completed: false,
            progress: 0
        },
        {
            id: 'earn_10k',
            name: 'quests.earn10k',
            desc: 'quests.earn10kDesc',
            icon: '💸',
            goal: 10000,
            metric: 'energy',
            reward: 1000,
            rewardType: 'energy',
            completed: false,
            progress: 0
        },
        {
            id: 'buy_5_upgrades',
            name: 'quests.buy5Upgrades',
            desc: 'quests.buy5UpgradesDesc',
            icon: '📦',
            goal: 5,
            metric: 'upgrades',
            reward: 2000,
            rewardType: 'energy',
            completed: false,
            progress: 0
        },
        {
            id: 'reach_1k_eps',
            name: 'quests.reach1kEps',
            desc: 'quests.reach1kEpsDesc',
            icon: '⚙️',
            goal: 1000,
            metric: 'eps',
            reward: 3000,
            rewardType: 'energy',
            completed: false,
            progress: 0
        },
        {
            id: 'prestige_once',
            name: 'quests.prestigeOnce',
            desc: 'quests.prestigeOnceDesc',
            icon: '✨',
            goal: 1,
            metric: 'prestige',
            reward: 5000,
            rewardType: 'energy',
            completed: false,
            progress: 0
        }
    ],
    
    /**
     * Инициализировать квесты
     */
    init(gameState) {
        if (!gameState.quests) {
            gameState.quests = [];
            this.quests.forEach(q => {
                gameState.quests.push({
                    ...q,
                    completed: false,
                    progress: 0,
                    claimedReward: false
                });
            });
        }
    },
    
    /**
     * Обновить прогресс квеста
     */
    updateProgress(gameState, metric, value) {
        if (!gameState.quests) this.init(gameState);
        
        gameState.quests.forEach(quest => {
            if (quest.metric === metric && !quest.completed) {
                quest.progress = Math.min(value, quest.goal);
                
                if (quest.progress >= quest.goal) {
                    quest.completed = true;
                }
            }
        });
    },
    
    /**
     * Получить активные квесты
     */
    getActive(gameState) {
        if (!gameState.quests) this.init(gameState);
        return gameState.quests.filter(q => !q.completed);
    },
    
    /**
     * Получить завершённые квесты
     */
    getCompleted(gameState) {
        if (!gameState.quests) this.init(gameState);
        return gameState.quests.filter(q => q.completed && !q.claimedReward);
    },
    
    /**
     * Забрать награду за квест
     */
    claimReward(gameState, questId) {
        if (!gameState.quests) this.init(gameState);
        
        const quest = gameState.quests.find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimedReward) return null;
        
        const reward = quest.reward;
        if (quest.rewardType === 'energy') {
            gameState.energy += reward;
            gameState.totalEarned += reward;
        }
        
        quest.claimedReward = true;
        return reward;
    },
    
    /**
     * Получить текущий прогресс
     */
    getProgress(gameState) {
        if (!gameState.quests) this.init(gameState);
        
        const completed = this.getCompleted(gameState).length;
        const total = gameState.quests.length;
        
        return {
            completed,
            total,
            percent: Math.round((completed / total) * 100)
        };
    }
};
