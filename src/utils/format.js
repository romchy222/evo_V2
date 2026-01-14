// Number formatting utilities

const FormatUtils = {
    /**
     * Format number with compact notation (1.2K, 3.4M, etc.)
     */
    compactNumber(num) {
        if (num === 0) return '0';
        if (num < 1000) return Math.floor(num).toString();
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
        const exponent = Math.min(
            Math.floor(Math.log10(Math.abs(num)) / 3),
            suffixes.length - 1
        );
        const value = num / Math.pow(1000, exponent);
        
        if (value >= 100) {
            return Math.floor(value) + suffixes[exponent];
        } else if (value >= 10) {
            return (Math.floor(value * 10) / 10).toFixed(1) + suffixes[exponent];
        } else {
            return (Math.floor(value * 100) / 100).toFixed(2) + suffixes[exponent];
        }
    },
    
    /**
     * Format number as full number with separators
     */
    fullNumber(num) {
        return Math.floor(num).toLocaleString();
    },
    
    /**
     * Format number based on config preference
     */
    format(num, mode = CONFIG.UI.numberFormat) {
        if (mode === 'compact') {
            return this.compactNumber(num);
        } else {
            return this.fullNumber(num);
        }
    },
    
    /**
     * Format duration in HH:MM:SS
     */
    duration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    },
    
    /**
     * Percentage format
     */
    percent(value, decimals = 1) {
        return (value * 100).toFixed(decimals) + '%';
    }
};
