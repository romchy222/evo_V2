// Simple audio helper - uses Web Audio API for sound effects

const AudioUtils = {
    isEnabled: true,
    audioContext: null,
    volume: 1,
    
    init() {
        try {
            // Initialize audio context lazily on first use
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (e) {
            logDebug('Web Audio API not available:', e);
        }
    },
    
    /**
     * Play a simple sine wave beep
     */
    playClick() {
        if (!this.isEnabled || !this.audioContext || this.volume <= 0) return;
        
        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            
            gain.gain.setValueAtTime(0.3 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            logDebug('Failed to play sound:', e);
        }
    },
    
    /**
     * Play purchase success sound
     */
    playSuccess() {
        if (!this.isEnabled || !this.audioContext || this.volume <= 0) return;
        
        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
            
            gain.gain.setValueAtTime(0.2 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            logDebug('Failed to play sound:', e);
        }
    },
    
    /**
     * Play error sound
     */
    playError() {
        if (!this.isEnabled || !this.audioContext || this.volume <= 0) return;
        
        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
            
            gain.gain.setValueAtTime(0.2 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            logDebug('Failed to play sound:', e);
        }
    },
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    },

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        return this.volume;
    }
};
