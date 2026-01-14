// View rendering for different screens

const Views = {
    /**
     * Render shop screen - purchasable generators
     */
    renderShop() {
        const container = document.getElementById('shopContainer');
        container.innerHTML = '';
        
        const items = Object.values(CONFIG.SHOP_ITEMS);
        
        items.forEach(item => {
            const count = GameState.shopItems?.[item.id] || 0;
            const purchaseAmount = UI.purchaseMode === 'max'
                ? Economy.calculateMaxAffordable(GameState.energy, count, item.basePrice, item.priceMultiplier)
                : UI.purchaseMode;
            const cost = Economy.calculateBulkCost(Math.max(1, purchaseAmount), count, item.basePrice, item.priceMultiplier);
            const income = item.baseIncome * Math.pow(item.effectMultiplier, count);
            
            const canAfford = purchaseAmount > 0 && GameState.energy >= cost;
            const isPaused = GameState.isPaused;
            
            const div = document.createElement('div');
            div.className = `shop-item ${canAfford ? 'affordable' : 'unaffordable'} ${isPaused ? 'disabled' : ''}`;
            
            const buyLabel = UI.purchaseMode === 'max'
                ? i18n.t('buyMax')
                : `${i18n.t('buy')} x${UI.purchaseMode}`;

            div.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.icon} ${i18n.t(item.name)}</div>
                    <div class="item-desc">${i18n.t(item.desc, { income: FormatUtils.format(income) })}</div>
                    <div class="item-effect">${i18n.t('effectLabel', { effect: `+${FormatUtils.format(income)}/s` })}</div>
                    <div class="item-level">${i18n.t('owned')}: ${count}</div>
                </div>
                <div class="item-price">
                    <div class="price-value">${FormatUtils.format(cost)}</div>
                    <div class="price-label">${i18n.t('currency')}</div>
                </div>
                <button class="buy-button" ${!canAfford || isPaused ? 'disabled' : ''} data-item="${item.id}">
                    ${buyLabel}
                </button>
            `;
            
            div.querySelector('.buy-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const result = GameState.buyShopItem(item.id, UI.purchaseMode);
                if (result && result.success) {
                    UI.showToast(i18n.t('purchaseSuccess'), 'success');
                    UI.updateSatellites();
                    Views.renderShop();
                    Views.renderHeader();
                } else {
                    AudioUtils.playError();
                    UI.showToast(i18n.t('notEnoughEnergy'), 'warning');
                }
            });
            
            container.appendChild(div);
        });
    },
    
    /**
     * Render upgrades screen - enhancements for clicks/generators
     */
    renderUpgrades() {
        const container = document.getElementById('upgradesContainer');
        container.innerHTML = '';
        
        // Show upgrade enhancements
        const upgradeItems = [
            { type: 'clickPower', nameKey: 'upgrades.clickPower', descKey: 'upgrades.clickPowerDesc' },
            { type: 'eps', nameKey: 'upgrades.eps', descKey: 'upgrades.epsDesc' },
            { type: 'multiplier', nameKey: 'upgrades.multiplier', descKey: 'upgrades.multiplierDesc' }
        ];
        
        upgradeItems.forEach(item => {
            const config = Economy.getUpgradeConfig(item.type);
            const level = GameState.upgrades[item.type];
            const purchaseAmount = UI.purchaseMode === 'max'
                ? Economy.calculateMaxAffordable(GameState.energy, level, config.basePrice, config.priceMultiplier)
                : UI.purchaseMode;
            const cost = Economy.calculateBulkCost(Math.max(1, purchaseAmount), level, config.basePrice, config.priceMultiplier);
            const currentEffect = Economy.calculateEffect(level, config.baseEffect, config.effectMultiplier);
            const nextEffect = Economy.calculateEffect(level + 1, config.baseEffect, config.effectMultiplier);
            
            const canAfford = purchaseAmount > 0 && GameState.energy >= cost;
            const isPaused = GameState.isPaused;
            
            const div = document.createElement('div');
            div.className = `upgrade-item ${canAfford ? 'affordable' : 'unaffordable'} ${isPaused ? 'disabled' : ''}`;
            
            const effect = item.type === 'multiplier'
                ? nextEffect.toFixed(2) + 'x'
                : '+' + FormatUtils.format(nextEffect);

            const buyLabel = UI.purchaseMode === 'max'
                ? i18n.t('buyMax')
                : `${i18n.t('buyButton')} x${UI.purchaseMode}`;
            
            div.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${config.icon} ${i18n.t(item.nameKey)}</div>
                    <div class="item-desc">${i18n.t(item.descKey, { effect: effect })}</div>
                    <div class="item-effect">${i18n.t('effectLabel', { effect: effect })}</div>
                    <div class="item-level">${i18n.t('upgradeLevel')}: ${level}</div>
                </div>
                <div class="item-price">
                    <div class="price-value">${FormatUtils.format(cost)}</div>
                    <div class="price-label">${i18n.t('priceLabel')}</div>
                </div>
                <button class="buy-button" ${!canAfford || isPaused ? 'disabled' : ''} data-type="${item.type}">
                    ${buyLabel}
                </button>
            `;
            
            div.querySelector('.buy-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const result = GameState.buyUpgrade(item.type, UI.purchaseMode);
                if (result && result.success) {
                    UI.showToast(i18n.t('purchaseSuccess'), 'success');
                    UI.updateSatellites();
                    Views.renderUpgrades();
                    Views.renderHeader();
                } else {
                    AudioUtils.playError();
                    UI.showToast(i18n.t('notEnoughEnergy'), 'warning', {
                        label: i18n.t('goToShop'),
                        onClick: () => UI.switchTab('shop')
                    });
                }
            });
            
            container.appendChild(div);
        });
    },
    
    /**
     * Render prestige screen
     */
    renderPrestige() {
        const container = document.getElementById('prestigeContainer');
        container.innerHTML = '';
        
        const canPrestige = GameState.canPrestige();
        const threshold = Economy.calculatePrestigeThreshold(GameState.prestigeCount);
        const availablePoints = GameState.getAvailablePrestigePoints();
        const bonusMultiplier = Economy.calculatePrestigeMultiplier(GameState.prestigeCount + availablePoints);
        
        let html = `
            <div class="prestige-info">
                <h3>${i18n.t('prestigeTitle')}</h3>
                <div class="prestige-stat">
                    ${i18n.t('prestigePoints')}: <span class="prestige-stat-value">${GameState.prestigePoints}</span>
                </div>
                <div class="prestige-stat">
                    ${i18n.t('totalEarned')}: <span class="prestige-stat-value">${FormatUtils.format(GameState.totalEarned)}</span>
                </div>
                <div class="prestige-stat">
                    ${i18n.t('prestigeRequirement')}: <span class="prestige-stat-value">${FormatUtils.format(threshold)}</span>
                </div>
                <div class="prestige-stat">
                    ${i18n.t('prestigeBonus')}: <span class="prestige-stat-value">x${bonusMultiplier.toFixed(2)}</span>
                </div>
                <div class="prestige-details">
                    <p>${i18n.t('prestigeResetList')}</p>
                    <ul>
                        <li>${i18n.t('prestigeResetEnergy')}</li>
                        <li>${i18n.t('prestigeResetUpgrades')}</li>
                        <li>${i18n.t('prestigeResetShop')}</li>
                    </ul>
                    <p>${i18n.t('prestigeKeepList')}</p>
                    <ul>
                        <li>${i18n.t('prestigeKeepPoints')}</li>
                        <li>${i18n.t('prestigeKeepAchievements')}</li>
                    </ul>
                </div>
        `;
        
        if (canPrestige) {
            html += `<div style="color: var(--success-color); margin-top: 12px; font-weight: bold;">${i18n.t('canPrestige')}</div>`;
        } else {
            const needed = threshold - GameState.totalEarned;
            html += `<div style="color: var(--text-secondary); margin-top: 12px;">Нужно ещё: ${FormatUtils.format(needed)}</div>`;
        }
        
        html += `</div>`;
        
        html += `
            <button id="prestigeButton" class="btn-primary" ${!canPrestige ? 'disabled' : ''}>
                ${canPrestige ? 
                    i18n.t('prestigeButton', { amount: availablePoints }) : 
                    'Недоступно'}
            </button>
        `;
        
        container.innerHTML = html;
        
        if (canPrestige) {
            document.getElementById('prestigeButton').addEventListener('click', () => {
                UI.showConfirm(
                    'Престиж',
                    i18n.t('prestigeConfirm', { bonus: 'x' + bonusMultiplier.toFixed(2) }),
                    () => {
                        GameState.prestige();
                        YandexSDKManager.submitScore(GameState.totalEarned);
                        UI.triggerPrestigeEffect();
                        Views.renderHeader();
                        Views.renderPrestige();
                        Views.renderShop();
                        UI.showMessage('Поздравляем!', `Вы получили ${availablePoints} очков престижа`);
                    }
                );
            });
        }
    },
    
    /**
     * Render leaderboard screen
     */
    renderLeaderboard() {
        const container = document.getElementById('leaderboardContainer');
        container.innerHTML = '<div class="leaderboard-entry" style="justify-content: center;"><p>' + i18n.t('leaderboardUpdating') + '</p></div>';
        
        YandexSDKManager.getLeaderboardEntries(10)
            .then(entries => {
                container.innerHTML = '';
                
                if (entries.length === 0) {
                    container.innerHTML = '<div class="leaderboard-entry" style="justify-content: center;"><p>' + i18n.t('leaderboardEmpty') + '</p></div>';
                    return;
                }
                
                entries.forEach(entry => {
                    const div = document.createElement('div');
                    div.className = 'leaderboard-entry';
                    div.innerHTML = `
                        <div class="leaderboard-rank">#${entry.rank}</div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${entry.name}</div>
                        </div>
                        <div class="leaderboard-score">${FormatUtils.format(entry.score)}</div>
                    `;
                    container.appendChild(div);
                });
            })
            .catch(e => {
                logError('Leaderboard error:', e);
                container.innerHTML = '<div class="leaderboard-entry" style="justify-content: center; color: var(--danger-color);"><p>' + i18n.t('leaderboardError') + '</p></div>';
            });
    },
    
    /**
     * Render header stats
     */
    renderHeader() {
        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            const previous = Number(el.getAttribute('data-value') || 0);
            el.textContent = value;
            el.setAttribute('data-value', value.replace(/[^0-9.]/g, ''));
            if (Number.isFinite(previous) && value && value !== el.getAttribute('data-last-text')) {
                el.classList.remove('stat-pop');
                void el.offsetWidth;
                el.classList.add('stat-pop');
            }
            el.setAttribute('data-last-text', value);
        };
        updateStat('energyDisplay', FormatUtils.format(GameState.energy));
        
        const prestigeMultiplier = Economy.calculatePrestigeMultiplier(GameState.prestigeCount);
        const totalEPS = GameState.eps * prestigeMultiplier;
        updateStat('epsDisplay', `${FormatUtils.format(totalEPS)}/s`);
        
        updateStat('clickPowerDisplay', FormatUtils.format(GameState.clickPower));
    },
    
    /**
     * Show offline notification
     */
    showOfflineNotification(offlineData) {
        const notif = document.getElementById('offlineNotification');
        const msgEl = document.getElementById('offlineMessage');
        
        const timeStr = TimeUtils.formatDiff(offlineData.time);
        const earnedStr = FormatUtils.format(offlineData.earned);
        msgEl.textContent = i18n.t('offlineMessage', { earned: earnedStr, time: timeStr });
        
        notif.classList.remove('hidden');
        
        document.getElementById('offlineOk').addEventListener('click', () => {
            notif.classList.add('hidden');
        }, { once: true });
    },
    
    /**
     * Show tutorial
     */
    showTutorial() {
        if (GameState.tutorialCompleted) return;
        
        const tutorial = document.getElementById('tutorial');
        const tutorialText = tutorial.querySelector('.tutorial-text');
        const steps = ['tutorialStep1', 'tutorialStep2', 'tutorialStep3'];
        const stepIndex = Math.min(GameState.tutorialStep, steps.length - 1);
        tutorialText.textContent = i18n.t(steps[stepIndex]);
        tutorial.classList.remove('hidden');
    },
    
    /**
     * Hide tutorial
     */
    hideTutorial() {
        document.getElementById('tutorial').classList.add('hidden');
    },

    /**
     * Advance tutorial steps
     */
    advanceTutorial() {
        if (GameState.tutorialCompleted) return;
        GameState.tutorialStep += 1;
        if (GameState.tutorialStep >= 3) {
            Views.completeTutorial();
            return;
        }
        Views.showTutorial();
    },
    
    /**
     * Mark tutorial as complete
     */
    completeTutorial() {
        GameState.tutorialCompleted = true;
        Views.hideTutorial();
    },
    
    /**
     * Render achievements screen
     */
    renderAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';
        
        const progress = AchievementSystem.getProgress(GameState);
        const progressFill = document.getElementById('achievementsProgressFill');
        const progressText = document.getElementById('achievementsProgressText');
        
        progressFill.style.width = progress.percent + '%';
        progressText.textContent = `${progress.unlocked}/${progress.total}`;
        
        const unlocked = AchievementSystem.getUnlocked(GameState);
        const locked = AchievementSystem.getLocked(GameState);
        
        // Show unlocked first
        unlocked.forEach(ach => {
            const div = document.createElement('div');
            div.className = 'achievement-item unlocked';
            div.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${i18n.t(ach.name)}</div>
                    <div class="achievement-desc">${i18n.t(ach.desc)}</div>
                </div>
                <div class="achievement-reward">+${FormatUtils.format(ach.reward)}</div>
            `;
            container.appendChild(div);
        });
        
        // Then locked (grayed out)
        locked.slice(0, 3).forEach(ach => {
            const div = document.createElement('div');
            div.className = 'achievement-item locked';
            div.innerHTML = `
                <div class="achievement-icon" style="opacity: 0.5;">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${i18n.t(ach.name)}</div>
                    <div class="achievement-desc">${i18n.t(ach.desc)}</div>
                </div>
                <div class="achievement-reward" style="opacity: 0.5;">+${FormatUtils.format(ach.reward)}</div>
            `;
            container.appendChild(div);
        });
    },
    
    /**
     * Render quests screen
     */
    renderQuests() {
        const container = document.getElementById('questsContainer');
        container.innerHTML = '';
        
        const progress = QuestSystem.getProgress(GameState);
        const progressFill = document.getElementById('questsProgressFill');
        const progressText = document.getElementById('questsProgressText');
        
        progressFill.style.width = progress.percent + '%';
        progressText.textContent = `${progress.completed}/${progress.total}`;
        
        const active = QuestSystem.getActive(GameState);
        const completed = QuestSystem.getCompleted(GameState);
        
        // Active quests
        active.forEach(quest => {
            const div = document.createElement('div');
            div.className = 'quest-item active';
            const percent = (quest.progress / quest.goal) * 100;
            
            div.innerHTML = `
                <div class="quest-icon">${quest.icon}</div>
                <div class="quest-info">
                    <div class="quest-name">${i18n.t(quest.name)}</div>
                    <div class="quest-desc">${i18n.t(quest.desc)}</div>
                    <div class="quest-progress-bar">
                        <div class="quest-progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                        ${Math.floor(quest.progress)}/${quest.goal}
                    </div>
                </div>
                <div class="quest-reward">+${FormatUtils.format(quest.reward)}</div>
            `;
            container.appendChild(div);
        });
        
        // Completed quests
        completed.forEach(quest => {
            const div = document.createElement('div');
            div.className = 'quest-item completed';
            
            div.innerHTML = `
                <div class="quest-icon">${quest.icon}</div>
                <div class="quest-info">
                    <div class="quest-name">${i18n.t(quest.name)} ✓</div>
                    <div class="quest-desc">${i18n.t(quest.desc)}</div>
                </div>
                <div class="quest-actions">
                    <button class="claim-button" data-quest-id="${quest.id}">Забрать</button>
                </div>
            `;
            
            div.querySelector('.claim-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const reward = QuestSystem.claimReward(GameState, quest.id);
                if (reward) {
                    Views.renderHeader();
                    Views.renderQuests();
                }
            });
            
            container.appendChild(div);
        });
    },
    
    /**
     * Render stats screen
     */
    renderStats() {
        const generalStats = document.getElementById('generalStatsContent');
        const powerUpsContent = document.getElementById('powerUpsContent');
        
        // General stats
        const stats = StatsSystem.getStats(GameState);
        generalStats.innerHTML = `
            <div class="stat-box">
                <div class="stat-box-label">${i18n.t('totalClicks')}</div>
                <div class="stat-box-value">${FormatUtils.format(stats.totalClicks)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-label">${i18n.t('maxCPS')}</div>
                <div class="stat-box-value">${stats.maxCPS}</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-label">${i18n.t('longestStreak')}</div>
                <div class="stat-box-value">${stats.longestStreak}</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-label">${i18n.t('avgEarningsPerClick')}</div>
                <div class="stat-box-value">${stats.averageEarningsPerClick}</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-label">${i18n.t('currentCombo')}</div>
                <div class="stat-box-value">${PowerUpSystem.comboData.currentCombo}</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-label">${i18n.t('maxCombo')}</div>
                <div class="stat-box-value">${PowerUpSystem.comboData.maxCombo}</div>
            </div>
        `;
        
        // Power-ups
        const powerUps = PowerUpSystem.getPowerUpsData(GameState);
        let html = '<div class="powerups-list">';
        
        powerUps.forEach(pu => {
            const timeRemaining = Math.ceil(pu.timeRemaining / 1000);
            html += `
                <div class="powerup-item ${pu.active ? 'active' : ''}">
                    <div class="powerup-info">
                        <div class="powerup-name">${pu.icon} ${i18n.t(pu.name)}</div>
                        <div class="powerup-desc">${i18n.t(pu.desc)}</div>
                    </div>
                    <div class="powerup-control">
                        ${pu.active ? 
                            `<div class="powerup-time">${timeRemaining}s</div>` :
                            `<button class="powerup-activate-btn" data-powerup-id="${pu.id}" ${GameState.energy < pu.cost ? 'disabled' : ''}>
                                ${i18n.t('activatePowerUp')} (${pu.cost})
                            </button>`
                        }
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        powerUpsContent.innerHTML = html;
        
        // Add event listeners
        powerUpsContent.querySelectorAll('.powerup-activate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const powerUpId = btn.getAttribute('data-powerup-id');
                if (PowerUpSystem.activatePowerUp(GameState, powerUpId)) {
                    Views.renderHeader();
                    Views.renderStats();
                }
            });
        });
        
        // Render chart
        this.renderStatsChart('energy');
    },
    
    /**
     * Render chart
     */
    renderStatsChart(type = 'energy') {
        const canvas = document.getElementById('statsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chartData = StatsSystem.getChartData(type);
        
        if (!chartData) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        
        const data = chartData.data;
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const padding = 20;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        // Draw line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const x = padding + (width / (data.length - 1 || 1)) * i;
            const normalizedValue = (data[i] - minValue) / (maxValue - minValue || 1);
            const y = canvas.height - padding - normalizedValue * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#ec4899';
        for (let i = 0; i < data.length; i++) {
            const x = padding + (width / (data.length - 1 || 1)) * i;
            const normalizedValue = (data[i] - minValue) / (maxValue - minValue || 1);
            const y = canvas.height - padding - normalizedValue * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};
