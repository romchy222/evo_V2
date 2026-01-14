// Time utilities

const TimeUtils = {
    /**
     * Get current timestamp
     */
    now() {
        return Date.now();
    },
    
    /**
     * Format time difference in readable format
     */
    formatDiff(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}д`;
        if (hours > 0) return `${hours}ч`;
        if (minutes > 0) return `${minutes}м`;
        return `${seconds}с`;
    },
    
    /**
     * Check if time has passed since last event
     */
    hasElapsed(lastTime, interval) {
        return this.now() - lastTime >= interval;
    },
    
    /**
     * Get seconds until next interval
     */
    secondsUntil(lastTime, interval) {
        return Math.max(0, Math.ceil((interval - (this.now() - lastTime)) / 1000));
    }
};
