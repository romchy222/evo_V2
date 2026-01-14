// Система статистики и графиков

const StatsSystem = {
    // История для графиков
    history: {
        timestamps: [],
        energy: [],
        eps: [],
        clicks: []
    },
    
    maxHistoryPoints: 60, // Хранить последние 60 точек
    lastRecordTime: 0,
    recordInterval: 10000, // Записывать каждые 10 сек
    
    /**
     * Инициализировать статистику
     */
    init(gameState) {
        if (!gameState.stats) {
            gameState.stats = {
                totalClicks: 0,
                maxClicksPerSecond: 0,
                sessionClicks: 0,
                sessionTime: TimeUtils.now(),
                longestClickStreak: 0,
                currentClickStreak: 0,
                lastClickTime: 0
            };
        }
    },
    
    /**
     * Записать клик
     */
    recordClick(gameState) {
        if (!gameState.stats) this.init(gameState);
        
        gameState.stats.totalClicks++;
        gameState.stats.sessionClicks++;
        
        // Клик-стрик (клики без перерыва)
        const now = TimeUtils.now();
        if (gameState.stats.lastClickTime && now - gameState.stats.lastClickTime < 5000) {
            gameState.stats.currentClickStreak++;
        } else {
            gameState.stats.currentClickStreak = 1;
        }
        
        gameState.stats.longestClickStreak = Math.max(
            gameState.stats.longestClickStreak,
            gameState.stats.currentClickStreak
        );
        
        gameState.stats.lastClickTime = now;
    },
    
    /**
     * Обновить CPS (клики в секунду)
     */
    updateCPS(gameState) {
        if (!gameState.stats) this.init(gameState);
        
        const sessionTime = (TimeUtils.now() - gameState.stats.sessionTime) / 1000;
        if (sessionTime > 0) {
            const cps = gameState.stats.sessionClicks / sessionTime;
            gameState.stats.maxClicksPerSecond = Math.max(
                gameState.stats.maxClicksPerSecond,
                cps
            );
        }
    },
    
    /**
     * Записать точку в историю для графика
     */
    recordHistory(gameState) {
        const now = TimeUtils.now();
        
        if (now - this.lastRecordTime < this.recordInterval) {
            return;
        }
        
        this.lastRecordTime = now;
        
        this.history.timestamps.push(now);
        this.history.energy.push(gameState.energy);
        this.history.eps.push(gameState.eps);
        this.history.clicks.push(gameState.stats?.totalClicks || 0);
        
        // Ограничить размер истории
        if (this.history.timestamps.length > this.maxHistoryPoints) {
            this.history.timestamps.shift();
            this.history.energy.shift();
            this.history.eps.shift();
            this.history.clicks.shift();
        }
    },
    
    /**
     * Получить данные для графика
     */
    getChartData(type = 'energy') {
        if (this.history.timestamps.length === 0) return null;
        
        const now = TimeUtils.now();
        const labels = this.history.timestamps.map(t => {
            const diff = Math.round((now - t) / 1000);
            if (diff < 60) return diff + 's';
            return Math.round(diff / 60) + 'm';
        });
        
        let data = [];
        if (type === 'energy') data = this.history.energy;
        else if (type === 'eps') data = this.history.eps;
        else if (type === 'clicks') data = this.history.clicks;
        
        return { labels, data };
    },
    
    /**
     * Получить все статистики
     */
    getStats(gameState) {
        if (!gameState.stats) this.init(gameState);
        
        const sessionTime = TimeUtils.now() - gameState.stats.sessionTime;
        
        return {
            totalClicks: gameState.stats.totalClicks,
            maxCPS: gameState.stats.maxClicksPerSecond.toFixed(2),
            longestStreak: gameState.stats.longestClickStreak,
            sessionTime: TimeUtils.formatDiff(sessionTime),
            averageEarningsPerClick: gameState.stats.totalClicks > 0 
                ? (gameState.totalEarned / gameState.stats.totalClicks).toFixed(2)
                : 0
        };
    }
};
