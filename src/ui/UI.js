// Main UI controller

const UI = {
    lastSaveTime: 0,
    lastCloudSyncTime: 0,
    adMultiplierEndTime: 0,
    
    /**
     * Initialize UI
     */
    init() {
        logDebug('Initializing UI');
        
        this.setupEventListeners();
        Views.renderHeader();
        Views.renderShop();
        
        // Show tutorial on first run
        if (!GameState.tutorialCompleted) {
            Views.showTutorial();
        }
    },
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Click button
        document.getElementById('clickButton').addEventListener('click', (e) => {
            e.preventDefault();
            const gain = GameState.click();
            if (gain > 0) {
                this.showFloatingNumber(gain, e.target);
            }
            Views.renderHeader();
        });
        
        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Back buttons
        document.querySelectorAll('[data-close-screen]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.backToGame();
            });
        });
        
        // Settings
        document.getElementById('soundToggle').addEventListener('click', (e) => {
            e.preventDefault();
            const enabled = AudioUtils.toggle();
            GameState.soundEnabled = enabled;
            e.target.classList.toggle('active');
            e.target.textContent = i18n.t(enabled ? 'on' : 'off');
        });
        
        document.querySelectorAll('.lang-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang');
                document.querySelectorAll('.lang-button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                i18n.setLanguage(lang);
                GameState.language = lang;
                this.updateUI();
            });
        });
        
        document.getElementById('watchAdBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.watchRewardedAd();
        });
        
        document.getElementById('syncCloudBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.syncCloud();
        });
        
        document.getElementById('resetBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showConfirm(
                'Внимание',
                i18n.t('resetConfirm'),
                () => {
                    SaveSystem.deleteAll();
                    GameState.reset();
                    this.updateUI();
                    this.backToGame();
                }
            );
        });
        
        document.getElementById('refreshLeaderboardBtn').addEventListener('click', (e) => {
            e.preventDefault();
            Views.renderLeaderboard();
        });
        
        // Modal close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
        
        // Visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                GameState.lastActive = TimeUtils.now();
                GameState.pause();
                this.saveGame();
                logDebug('Tab hidden, game paused and saved');
            } else {
                const offlineData = GameState.handleOfflineIncome();
                GameState.resume();
                this.updateUI();
                if (offlineData) {
                    Views.showOfflineNotification(offlineData);
                    GameState.isOffline = false;
                }
                logDebug('Tab visible, game resumed');
            }
        });
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    },
    
    /**
     * Switch between tabs
     */
    switchTab(tab) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Hide game screen, show tab screen
        document.getElementById('gameScreen').classList.remove('active');
        
        // Render tab content
        if (tab === 'shop') {
            document.getElementById('shopScreen').classList.add('active');
            Views.renderShop();
        } else if (tab === 'upgrades') {
            document.getElementById('upgradesScreen').classList.add('active');
            Views.renderUpgrades();
        } else if (tab === 'prestige') {
            document.getElementById('prestigeScreen').classList.add('active');
            Views.renderPrestige();
        } else if (tab === 'leaderboard') {
            document.getElementById('leaderboardScreen').classList.add('active');
            Views.renderLeaderboard();
        } else if (tab === 'achievements') {
            document.getElementById('achievementsScreen').classList.add('active');
            Views.renderAchievements();
        } else if (tab === 'quests') {
            document.getElementById('questsScreen').classList.add('active');
            Views.renderQuests();
        } else if (tab === 'stats') {
            document.getElementById('statsScreen').classList.add('active');
            Views.renderStats();
        } else if (tab === 'settings') {
            document.getElementById('settingsScreen').classList.add('active');
            this.updateSettingsUI();
        }
    },
    
    /**
     * Back to game
     */
    backToGame() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('gameScreen').classList.add('active');
        document.querySelector('[data-tab="shop"]').classList.add('active');
    },
    
    /**
     * Update settings UI
     */
    updateSettingsUI() {
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.classList.toggle('active', AudioUtils.isEnabled);
        soundBtn.textContent = i18n.t(AudioUtils.isEnabled ? 'on' : 'off');
        
        document.querySelectorAll('.lang-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === i18n.getLanguage()) {
                btn.classList.add('active');
            }
        });
    },
    
    /**
     * Show floating number when clicking
     */
    showFloatingNumber(amount, sourceEl) {
        const container = document.getElementById('floatingNumbers');
        const number = document.createElement('div');
        number.className = 'floating-number';
        number.textContent = '+' + FormatUtils.format(amount);
        
        const rect = sourceEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        number.style.left = x + 'px';
        number.style.top = y + 'px';
        
        container.appendChild(number);
        
        setTimeout(() => number.remove(), 1000);
    },
    
    /**
     * Watch rewarded ad
     */
    async watchRewardedAd() {
        logDebug('Watching rewarded ad...');
        const result = await YandexSDKManager.showRewarded();
        
        if (result.success) {
            GameState.applyAdBonus();
            this.showMessage(
                'Успех!',
                i18n.t('adRewarded', {
                    multiplier: CONFIG.AD.rewardedBonus.multiplier,
                    duration: TimeUtils.formatDiff(CONFIG.AD.rewardedBonus.duration)
                })
            );
            Views.renderHeader();
        } else {
            if (!YandexSDKManager.isLocalStub) {
                this.showMessage('Ошибка', i18n.t('errorNoAd'));
            } else {
                // In stub mode, reward anyway after simulation
                await new Promise(r => setTimeout(r, 1500));
                GameState.applyAdBonus();
                this.showMessage(
                    'Успех!',
                    i18n.t('adRewarded', {
                        multiplier: CONFIG.AD.rewardedBonus.multiplier,
                        duration: TimeUtils.formatDiff(CONFIG.AD.rewardedBonus.duration)
                    })
                );
                Views.renderHeader();
            }
        }
    },
    
    /**
     * Sync with cloud
     */
    async syncCloud() {
        logDebug('Syncing with cloud...');
        const status = document.getElementById('leaderboardStatus');
        status.textContent = i18n.t('leaderboardUpdating');
        
        try {
            const cloudData = await SaveSystem.loadCloud();
            if (cloudData) {
                const localData = GameState.serialize();
                const merged = SaveSystem.merge(localData, cloudData);
                GameState.init(merged);
            }
            
            await SaveSystem.saveCloud(GameState.serialize());
            
            status.textContent = i18n.t('cloudSyncSuccess');
            setTimeout(() => status.textContent = '', 3000);
        } catch (e) {
            logError('Cloud sync error:', e);
            status.textContent = i18n.t('cloudSyncError');
            setTimeout(() => status.textContent = '', 3000);
        }
    },
    
    /**
     * Show confirmation dialog
     */
    showConfirm(title, message, onConfirm, onCancel) {
        const dialog = document.getElementById('confirmDialog');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        
        // Clear old listeners
        yesBtn.replaceWith(yesBtn.cloneNode(true));
        noBtn.replaceWith(noBtn.cloneNode(true));
        
        document.getElementById('confirmYes').addEventListener('click', () => {
            dialog.classList.add('hidden');
            if (onConfirm) onConfirm();
        });
        
        document.getElementById('confirmNo').addEventListener('click', () => {
            dialog.classList.add('hidden');
            if (onCancel) onCancel();
        });
        
        dialog.classList.remove('hidden');
    },
    
    /**
     * Show message dialog
     */
    showMessage(title, text) {
        const dialog = document.getElementById('messageDialog');
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        
        const okBtn = document.getElementById('messageOk');
        okBtn.replaceWith(okBtn.cloneNode(true));
        
        document.getElementById('messageOk').addEventListener('click', () => {
            dialog.classList.add('hidden');
        });
        
        dialog.classList.remove('hidden');
    },
    
    /**
     * Save game
     */
    async saveGame() {
        const now = TimeUtils.now();
        
        // Local save
        if (now - this.lastSaveTime > CONFIG.AUTO_SAVE_INTERVAL) {
            SaveSystem.saveLocal(GameState.serialize());
            this.lastSaveTime = now;
        }
        
        // Cloud sync
        if (now - this.lastCloudSyncTime > CONFIG.CLOUD_SYNC_INTERVAL) {
            try {
                await SaveSystem.saveCloud(GameState.serialize());
                this.lastCloudSyncTime = now;
            } catch (e) {
                logDebug('Cloud save failed (expected in local mode)');
            }
        }
    },
    
    /**
     * Update entire UI
     */
    updateUI() {
        Views.renderHeader();
        Views.renderShop();
        this.updateSettingsUI();
    }
};
