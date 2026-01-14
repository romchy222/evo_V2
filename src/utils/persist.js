// Persistence utilities - handle both localStorage and cloud (async)

const PersistUtils = {
    /**
     * Local storage wrapper
     */
    getLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            logError('Failed to read from local save:', e);
            return null;
        }
    },
    
    setLocal(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            logError('Failed to write to local save:', e);
            return false;
        }
    },
    
    removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            logError('Failed to remove from local save:', e);
            return false;
        }
    },
    
    clearLocal() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            logError('Failed to clear local save:', e);
            return false;
        }
    },
    
    /**
     * Get all keys
     */
    getLocalKeys() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            return keys;
        } catch (e) {
            return [];
        }
    }
};
