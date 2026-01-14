// Main UI controller

const UI = {
    lastSaveTime: 0,
    lastCloudSyncTime: 0,
    adMultiplierEndTime: 0,
    purchaseMode: 1,
    meteorTimer: null,
    
    /**
     * Initialize UI
     */
    init() {
        logDebug('Initializing UI');
        
        this.setupEventListeners();
        this.buildStarfield();
        this.updateSatellites();
        this.updatePurchaseButtons();
        this.scheduleMeteor();
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
            const result = GameState.click();
            if (result && result.gain > 0) {
                this.showFloatingNumber(result.gain, e.target, result.isCrit, result.critMultiplier);
                this.spawnClickParticles(e.target);
                this.triggerClickEffects();
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

        document.querySelectorAll('.volume-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const level = Number(btn.getAttribute('data-volume'));
                AudioUtils.setVolume(level / 100);
                GameState.soundVolume = level / 100;
                this.updateSettingsUI();
            });
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

        document.querySelectorAll('[data-purchase-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.getAttribute('data-purchase-mode');
                this.purchaseMode = mode === 'max' ? 'max' : Number(mode);
                document.querySelectorAll('[data-purchase-mode]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Views.renderShop();
                Views.renderUpgrades();
            });
        });

        const tutorialOk = document.getElementById('tutorialOk');
        if (tutorialOk) {
            tutorialOk.addEventListener('click', (e) => {
                e.preventDefault();
                Views.advanceTutorial();
            });
        }
        
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
            this.updatePurchaseButtons();
        } else if (tab === 'upgrades') {
            document.getElementById('upgradesScreen').classList.add('active');
            Views.renderUpgrades();
            this.updatePurchaseButtons();
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

    updatePurchaseButtons() {
        document.querySelectorAll('[data-purchase-mode]').forEach(btn => {
            const mode = btn.getAttribute('data-purchase-mode');
            const isActive = this.purchaseMode === (mode === 'max' ? 'max' : Number(mode));
            btn.classList.toggle('active', isActive);
        });
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

        document.querySelectorAll('.volume-button').forEach(btn => {
            const level = Number(btn.getAttribute('data-volume'));
            btn.classList.toggle('active', Math.round(AudioUtils.volume * 100) === level);
        });
        
        document.querySelectorAll('.lang-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === i18n.getLanguage()) {
                btn.classList.add('active');
            }
        });

        const watchAdBtn = document.getElementById('watchAdBtn');
        if (watchAdBtn) {
            const now = TimeUtils.now();
            const onCooldown = now - GameState.lastAdRewarded < CONFIG.AD.rewardedCooldown;
            const bonusActive = GameState.offlineMultiplierEnd > now;
            watchAdBtn.disabled = onCooldown || bonusActive;
            watchAdBtn.classList.toggle('disabled', onCooldown || bonusActive);
        }
    },
    
    /**
     * Show floating number when clicking
     */
    showFloatingNumber(amount, sourceEl, isCrit = false, critMultiplier = 1) {
        const container = document.getElementById('floatingNumbers');
        const number = document.createElement('div');
        number.className = `floating-number${isCrit ? ' crit' : ''}`;
        number.textContent = isCrit
            ? `CRIT +${FormatUtils.format(amount)}`
            : '+' + FormatUtils.format(amount);
        
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
        const now = TimeUtils.now();
        if (GameState.offlineMultiplierEnd > now) {
            this.showToast(i18n.t('bonusActive'), 'info');
            return;
        }
        if (now - GameState.lastAdRewarded < CONFIG.AD.rewardedCooldown) {
            this.showToast(i18n.t('adCooldown'), 'warning');
            return;
        }
        const result = await YandexSDKManager.showRewarded();
        
        if (result.success) {
            GameState.applyAdBonus();
            GameState.lastAdRewarded = TimeUtils.now();
            this.showToast(i18n.t('rewardReceived', { reward: '+' + FormatUtils.format(GameState.eps) }), 'success');
            this.showMessage(
                'Успех!',
                i18n.t('adRewarded', {
                    multiplier: CONFIG.AD.rewardedBonus.multiplier,
                    duration: TimeUtils.formatDiff(CONFIG.AD.rewardedBonus.duration)
                })
            );
            Views.renderHeader();
            this.updateSettingsUI();
        } else {
            if (!YandexSDKManager.isLocalStub) {
                this.showMessage('Ошибка', i18n.t('errorNoAd'));
            } else {
                // In stub mode, reward anyway after simulation
                await new Promise(r => setTimeout(r, 1500));
                GameState.applyAdBonus();
                GameState.lastAdRewarded = TimeUtils.now();
                this.showToast(i18n.t('rewardReceived', { reward: '+' + FormatUtils.format(GameState.eps) }), 'success');
                this.showMessage(
                    'Успех!',
                    i18n.t('adRewarded', {
                        multiplier: CONFIG.AD.rewardedBonus.multiplier,
                        duration: TimeUtils.formatDiff(CONFIG.AD.rewardedBonus.duration)
                    })
                );
                Views.renderHeader();
                this.updateSettingsUI();
            }
        }
    },

    triggerClickEffects() {
        const button = document.getElementById('clickButton');
        button.classList.remove('click-hit');
        button.classList.remove('glow-flash');
        void button.offsetWidth;
        button.classList.add('click-hit');
        button.classList.add('glow-flash');

        const app = document.getElementById('app');
        app.classList.remove('screen-shake');
        void app.offsetWidth;
        app.classList.add('screen-shake');

        setTimeout(() => {
            button.classList.remove('click-hit');
            button.classList.remove('glow-flash');
            app.classList.remove('screen-shake');
        }, 200);
    },

    triggerPrestigeEffect() {
        const button = document.getElementById('clickButton');
        button.classList.remove('prestige-flash');
        void button.offsetWidth;
        button.classList.add('prestige-flash');
    },

    spawnClickParticles(sourceEl) {
        const container = document.getElementById('particleContainer');
        if (!container) return;
        const count = Math.floor(
            CONFIG.CLICK.particleMin + Math.random() * (CONFIG.CLICK.particleMax - CONFIG.CLICK.particleMin + 1)
        );
        const rect = sourceEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');
            particle.className = 'click-particle';
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.setProperty('--dx', `${x}px`);
            particle.style.setProperty('--dy', `${y}px`);
            particle.style.setProperty('--size', `${4 + Math.random() * 6}px`);
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 700);
        }
    },

    buildStarfield() {
        const starfield = document.getElementById('starfield');
        if (!starfield) return;
        starfield.innerHTML = '';
        const count = 50;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 10}s`;
            star.style.animationDuration = `${12 + Math.random() * 12}s`;
            starfield.appendChild(star);
        }
    },

    updateSatellites() {
        const totalUpgrades = (GameState.upgrades.clickPower || 0)
            + (GameState.upgrades.eps || 0)
            + (GameState.upgrades.multiplier || 0);
        const totalShop = Object.values(GameState.shopItems || {}).reduce((sum, val) => sum + val, 0);
        const satellites = Math.min(10, Math.floor((totalUpgrades + totalShop) / 2));
        const orbits = document.querySelectorAll('.orbit');

        orbits.forEach((orbit, idx) => {
            orbit.querySelectorAll('.satellite').forEach(node => node.remove());
            const count = Math.min(3, Math.max(0, satellites - idx * 2));
            for (let i = 0; i < count; i++) {
                const sat = document.createElement('span');
                sat.className = 'satellite';
                sat.style.transform = `rotate(${(360 / count) * i}deg) translateX(${60 + idx * 25}px)`;
                orbit.appendChild(sat);
            }
        });
    },

    scheduleMeteor() {
        if (this.meteorTimer) {
            clearTimeout(this.meteorTimer);
        }
        const delay = CONFIG.METEOR.minInterval
            + Math.random() * (CONFIG.METEOR.maxInterval - CONFIG.METEOR.minInterval);
        this.meteorTimer = setTimeout(() => this.spawnMeteor(), delay);
    },

    spawnMeteor() {
        const container = document.getElementById('meteorContainer');
        if (!container || GameState.isPaused) {
            this.scheduleMeteor();
            return;
        }
        container.innerHTML = '';
        const meteor = document.createElement('button');
        meteor.className = 'meteor';
        meteor.type = 'button';
        meteor.style.left = `${15 + Math.random() * 70}%`;
        meteor.style.top = `${20 + Math.random() * 40}%`;
        meteor.addEventListener('click', (e) => {
            e.preventDefault();
            const bonus = CONFIG.METEOR.bonusFlat + (GameState.eps * CONFIG.METEOR.bonusMultiplier);
            GameState.energy += bonus;
            GameState.totalEarned += bonus;
            this.showToast(i18n.t('meteorReward', { reward: FormatUtils.format(bonus) }), 'success');
            Views.renderHeader();
            meteor.remove();
            this.scheduleMeteor();
        }, { once: true });
        container.appendChild(meteor);
        setTimeout(() => {
            meteor.remove();
            this.scheduleMeteor();
        }, 7000);
    },

    showToast(message, type = 'info', action) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            ${action ? `<button class="toast-action">${action.label}</button>` : ''}
        `;
        if (action) {
            toast.querySelector('.toast-action').addEventListener('click', () => {
                action.onClick();
                toast.remove();
            });
        }
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
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
        Views.renderUpgrades();
        this.updateSatellites();
        this.updateSettingsUI();
    }
};
