// Localization system

const i18n = {
    currentLanguage: CONFIG.DEFAULT_LANGUAGE,
    
    translations: {
        ru: {
            // Common
            ok: 'ОК',
            yes: 'Да',
            no: 'Нет',
            on: 'ВКЛ',
            off: 'ВЫКЛ',
            
            // Main UI
            currency: 'Энергия',
            eps: 'EPS',
            clickPower: 'Клик',
            click: 'Тапните!',
            shop: 'Магазин',
            upgrades: 'Улучшения',
            prestige: 'Престиж',
            leaderboard: 'Лидерборд',
            achievements: 'Ачивки',
            quests: 'Квесты',
            stats: 'Статистика',
            settings: 'Настройки',
            refresh: 'Обновить',
            
            // Shop
            shopItems: [
                { name: 'Усилитель клика', desc: '+{effect} за клик' },
                { name: 'Генератор энергии', desc: '+{effect} в сек' },
                { name: 'Мультипликатор', desc: 'x{effect} ко всему доходу' }
            ],
            
            // Shop Items (generators)
            'shop.basicClicker': 'Базовый кликер',
            'shop.basicClickerDesc': 'Простой помощник, +{income} к доходу',
            'shop.autoClicker': 'Автокликер',
            'shop.autoClickerDesc': 'Автоматический кликер, +{income} в сек',
            'shop.miningRig': 'Майнинг риг',
            'shop.miningRigDesc': 'Мощный генератор, +{income} в сек',
            'shop.quantumGenerator': 'Квантовый генератор',
            'shop.quantumGeneratorDesc': 'Передовая технология, +{income} в сек',
            'shop.galaxyForge': 'Галактическая кузница',
            'shop.galaxyForgeDesc': 'Космическая станция, +{income} в сек',
            owned: 'Владеете',
            
            // Upgrades
            upgradeLevel: 'Уровень',
            currentEffect: 'Текущий эффект',
            nextEffect: 'Следующий эффект',
            
            // Prestige
            prestigeTitle: 'Система Престижа',
            totalEarned: 'Всего заработано',
            prestigePoints: 'Очки престижа',
            prestigeBonus: 'Постоянный бонус',
            prestigeRequirement: 'Необходимо заработать {amount} энергии',
            canPrestige: 'Вы готовы к престижу!',
            prestigeButton: 'Престиж ({amount} очков)',
            prestigeConfirm: 'Вы потеряете весь прогресс, но получите постоянный бонус {bonus}',
            
            // Leaderboard
            leaderboardEmpty: 'Лидерборд пуст',
            leaderboardRank: 'Место',
            leaderboardScore: 'Очки',
            leaderboardUpdating: 'Обновление...',
            leaderboardError: 'Ошибка загрузки лидерборда',
            
            // Achievements
            achievementsTitle: 'Достижения',
            achievementsUnlocked: 'Разблокировано',
            'achievements.firstClick': 'Первый клик',
            'achievements.firstClickDesc': 'Сделайте ваш первый клик',
            'achievements.hundredClicks': 'Сотня',
            'achievements.hundredClicksDesc': 'Сделайте 100 кликов',
            'achievements.thousandClicks': 'Тысячник',
            'achievements.thousandClicksDesc': 'Сделайте 1000 кликов',
            'achievements.millionaire': 'Миллионер',
            'achievements.millionaireDesc': 'Заработайте 1 млн энергии',
            'achievements.billionaire': 'Миллиардер',
            'achievements.billionaireDesc': 'Заработайте 1 млрд энергии',
            'achievements.firstPrestige': 'Первый престиж',
            'achievements.firstPrestigeDesc': 'Достигните первого престижа',
            'achievements.triplePrestige': 'Троекратный престиж',
            'achievements.triplePrestigeDesc': 'Достигните третьего престижа',
            'achievements.speedyClicker': 'Молниеносный кликер',
            'achievements.speedyClickerDesc': '10 кликов в секунду',
            'achievements.passiveMaster': 'Мастер пассива',
            'achievements.passiveMasterDesc': '1000 дохода в секунду',
            'achievements.tenUpgrades': 'Коллекционер',
            'achievements.tenUpgradesDesc': 'Купите 10 улучшений',
            
            // Quests
            questsTitle: 'Квесты',
            'quests.click50': '50 кликов',
            'quests.click50Desc': 'Сделайте 50 кликов',
            'quests.earn10k': 'Заработайте 10K',
            'quests.earn10kDesc': 'Заработайте 10,000 энергии',
            'quests.buy5Upgrades': '5 улучшений',
            'quests.buy5UpgradesDesc': 'Купите 5 улучшений',
            'quests.reach1kEps': '1K EPS',
            'quests.reach1kEpsDesc': 'Достигните 1000 дохода в сек',
            'quests.prestigeOnce': 'Престиж',
            'quests.prestigeOnceDesc': 'Достигните первого престижа',
            questProgress: 'Прогресс',
            questReward: 'Награда',
            claimReward: 'Забрать награду',
            
            // Stats
            generalStats: 'Общая статистика',
            powerUps: 'Усилители',
            charts: 'Графики',
            totalClicks: 'Всего кликов',
            maxCPS: 'Макс клики/сек',
            longestStreak: 'Самая длинная серия',
            sessionTime: 'Время сессии',
            avgEarningsPerClick: 'Средний доход на клик',
            currentCombo: 'Текущее комбо',
            maxCombo: 'Макс комбо',
            
            // Power-ups
            'powerUps.x2Income': 'x2 Доход',
            'powerUps.x2IncomeDesc': 'Удвойте весь доход на 30 сек',
            'powerUps.x5Clicks': 'x5 Клики',
            'powerUps.x5ClicksDesc': 'Увеличьте урон клика в 5 раз на 20 сек',
            'powerUps.autoClicker': 'Автокликер',
            'powerUps.autoClickerDesc': '10 автоматических кликов на 15 сек',
            activatePowerUp: 'Активировать',
            powerUpCost: 'Стоимость',
            powerUpDuration: 'Длительность',
            powerUpActive: 'Активен',
            
            // Combo
            combo: 'Комбо',
            comboMultiplier: 'Множитель комбо',
            
            // Settings
            soundLabel: 'Звук',
            languageLabel: 'Язык',
            watchAdForBonus: 'Смотреть рекламу за бонус',
            syncCloud: 'Синхронизировать с облаком',
            resetProgress: 'Сбросить прогресс',
            resetConfirm: 'Это удалит весь ваш прогресс! Вы уверены?',
            resetSuccess: 'Прогресс сброшен',
            
            // Offline
            offlineTitle: 'Вы были оффлайн',
            offlineMessage: 'Получено {earned} энергии за {time} оффлайна',
            
            // Errors and messages
            errorNoAd: 'Реклама недоступна',
            errorAd: 'Ошибка при загрузке рекламы',
            adWatched: 'Спасибо за просмотр! Бонус активирован на {duration}',
            adRewarded: 'x{multiplier} к доходу на {duration}',
            cloudSyncSuccess: 'Прогресс синхронизирован с облаком',
            cloudSyncError: 'Ошибка синхронизации',
            
            // Upgrades descriptions
            'upgrades.clickPower': 'Усилитель клика',
            'upgrades.clickPowerDesc': 'Увеличивает урон за клик',
            'upgrades.eps': 'Генератор энергии',
            'upgrades.epsDesc': 'Увеличивает доход в секунду',
            'upgrades.multiplier': 'Мультипликатор',
            'upgrades.multiplierDesc': 'Увеличивает ВСЕ источники дохода',
            
            // Tutorial
            tutorialStep1: 'Тапните по центральному объекту, чтобы получить энергию!',
            tutorialStep2: 'Используйте заработанную энергию для покупки улучшений',
            tutorialStep3: 'Автоматический доход будет расти с каждым улучшением',
            
            // Other
            levelShort: 'Ур.',
            priceLabel: 'Цена',
            buyButton: 'Купить',
            bought: 'Куплено!',
            notAffordable: 'Недостаточно',
            playerRank: 'Ваше место: {rank}',
            yourScore: 'Ваш результат: {score}',
            newAchievement: 'Новое достижение!',
            questCompleted: 'Квест завершён!',
            rewardReceived: 'Награда получена: +{reward}'
        },
        
        en: {
            // Common
            ok: 'OK',
            yes: 'Yes',
            no: 'No',
            on: 'ON',
            off: 'OFF',
            
            // Main UI
            currency: 'Energy',
            eps: 'EPS',
            clickPower: 'Click Power',
            click: 'Tap!',
            shop: 'Shop',
            upgrades: 'Upgrades',
            prestige: 'Prestige',
            leaderboard: 'Leaderboard',
            achievements: 'Achievements',
            quests: 'Quests',
            stats: 'Stats',
            settings: 'Settings',
            refresh: 'Refresh',
            
            // Shop
            shopItems: [
                { name: 'Click Booster', desc: '+{effect} per click' },
                { name: 'Energy Generator', desc: '+{effect} per sec' },
                { name: 'Multiplier', desc: 'x{effect} all income' }
            ],
            
            // Shop Items (generators)
            'shop.basicClicker': 'Basic Clicker',
            'shop.basicClickerDesc': 'Simple helper, +{income} income',
            'shop.autoClicker': 'Auto Clicker',
            'shop.autoClickerDesc': 'Auto clicker, +{income} per sec',
            'shop.miningRig': 'Mining Rig',
            'shop.miningRigDesc': 'Powerful generator, +{income} per sec',
            'shop.quantumGenerator': 'Quantum Generator',
            'shop.quantumGeneratorDesc': 'Advanced tech, +{income} per sec',
            'shop.galaxyForge': 'Galaxy Forge',
            'shop.galaxyForgeDesc': 'Space station, +{income} per sec',
            owned: 'Owned',
            
            // Upgrades
            upgradeLevel: 'Level',
            currentEffect: 'Current Effect',
            nextEffect: 'Next Effect',
            
            // Prestige
            prestigeTitle: 'Prestige System',
            totalEarned: 'Total Earned',
            prestigePoints: 'Prestige Points',
            prestigeBonus: 'Permanent Bonus',
            prestigeRequirement: 'Need to earn {amount} energy',
            canPrestige: 'You are ready for prestige!',
            prestigeButton: 'Prestige ({amount} points)',
            prestigeConfirm: 'You will lose all progress but gain permanent bonus {bonus}',
            
            // Leaderboard
            leaderboardEmpty: 'Leaderboard is empty',
            leaderboardRank: 'Rank',
            leaderboardScore: 'Score',
            leaderboardUpdating: 'Updating...',
            leaderboardError: 'Failed to load leaderboard',
            
            // Achievements
            achievementsTitle: 'Achievements',
            achievementsUnlocked: 'Unlocked',
            'achievements.firstClick': 'First Click',
            'achievements.firstClickDesc': 'Make your first click',
            'achievements.hundredClicks': 'Hundred',
            'achievements.hundredClicksDesc': 'Make 100 clicks',
            'achievements.thousandClicks': 'Thousand',
            'achievements.thousandClicksDesc': 'Make 1000 clicks',
            'achievements.millionaire': 'Millionaire',
            'achievements.millionaireDesc': 'Earn 1M energy',
            'achievements.billionaire': 'Billionaire',
            'achievements.billionaireDesc': 'Earn 1B energy',
            'achievements.firstPrestige': 'First Prestige',
            'achievements.firstPrestigeDesc': 'Reach first prestige',
            'achievements.triplePrestige': 'Triple Prestige',
            'achievements.triplePrestigeDesc': 'Reach third prestige',
            'achievements.speedyClicker': 'Speedy Clicker',
            'achievements.speedyClickerDesc': '10 clicks per second',
            'achievements.passiveMaster': 'Passive Master',
            'achievements.passiveMasterDesc': '1000 income per second',
            'achievements.tenUpgrades': 'Collector',
            'achievements.tenUpgradesDesc': 'Buy 10 upgrades',
            
            // Quests
            questsTitle: 'Quests',
            'quests.click50': '50 Clicks',
            'quests.click50Desc': 'Make 50 clicks',
            'quests.earn10k': 'Earn 10K',
            'quests.earn10kDesc': 'Earn 10,000 energy',
            'quests.buy5Upgrades': '5 Upgrades',
            'quests.buy5UpgradesDesc': 'Buy 5 upgrades',
            'quests.reach1kEps': '1K EPS',
            'quests.reach1kEpsDesc': 'Reach 1000 income per sec',
            'quests.prestigeOnce': 'Prestige',
            'quests.prestigeOnceDesc': 'Reach first prestige',
            questProgress: 'Progress',
            questReward: 'Reward',
            claimReward: 'Claim Reward',
            
            // Stats
            generalStats: 'General Stats',
            powerUps: 'Power-ups',
            charts: 'Charts',
            totalClicks: 'Total Clicks',
            maxCPS: 'Max Clicks/Sec',
            longestStreak: 'Longest Streak',
            sessionTime: 'Session Time',
            avgEarningsPerClick: 'Avg Earnings Per Click',
            currentCombo: 'Current Combo',
            maxCombo: 'Max Combo',
            
            // Power-ups
            'powerUps.x2Income': 'x2 Income',
            'powerUps.x2IncomeDesc': 'Double all income for 30 sec',
            'powerUps.x5Clicks': 'x5 Clicks',
            'powerUps.x5ClicksDesc': 'Increase click damage 5x for 20 sec',
            'powerUps.autoClicker': 'Auto Clicker',
            'powerUps.autoClickerDesc': '10 automatic clicks for 15 sec',
            activatePowerUp: 'Activate',
            powerUpCost: 'Cost',
            powerUpDuration: 'Duration',
            powerUpActive: 'Active',
            
            // Combo
            combo: 'Combo',
            comboMultiplier: 'Combo Multiplier',
            
            // Settings
            soundLabel: 'Sound',
            languageLabel: 'Language',
            watchAdForBonus: 'Watch ad for bonus',
            syncCloud: 'Sync with cloud',
            resetProgress: 'Reset Progress',
            resetConfirm: 'This will delete all your progress! Are you sure?',
            resetSuccess: 'Progress reset',
            
            // Offline
            offlineTitle: 'You were offline',
            offlineMessage: 'You earned {earned} energy during {time} offline',
            
            // Errors and messages
            errorNoAd: 'Ad not available',
            errorAd: 'Error loading ad',
            adWatched: 'Thanks for watching! Bonus active for {duration}',
            adRewarded: 'x{multiplier} income for {duration}',
            cloudSyncSuccess: 'Progress synced with cloud',
            cloudSyncError: 'Sync failed',
            
            // Upgrades descriptions
            'upgrades.clickPower': 'Click Power',
            'upgrades.clickPowerDesc': 'Increases damage per click',
            'upgrades.eps': 'Energy Generator',
            'upgrades.epsDesc': 'Increases income per second',
            'upgrades.multiplier': 'Multiplier',
            'upgrades.multiplierDesc': 'Increases ALL income sources',
            
            // Tutorial
            tutorialStep1: 'Tap the center object to earn energy!',
            tutorialStep2: 'Use earned energy to buy upgrades',
            tutorialStep3: 'Passive income will grow with each upgrade',
            
            // Other
            levelShort: 'Lvl',
            priceLabel: 'Price',
            buyButton: 'Buy',
            bought: 'Bought!',
            notAffordable: 'Not enough',
            playerRank: 'Your rank: {rank}',
            yourScore: 'Your score: {score}',
            newAchievement: 'New Achievement!',
            questCompleted: 'Quest Complete!',
            rewardReceived: 'Reward received: +{reward}'
        }
    },
    
    /**
     * Set current language
     */
    setLanguage(lang) {
        if (CONFIG.LANGUAGES.includes(lang)) {
            this.currentLanguage = lang;
            document.documentElement.lang = lang;
            this.updatePageText();
            StorageUtils.setLocal('language', lang);
        }
    },
    
    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    },
    
    /**
     * Translate a key with optional replacements
     */
    t(key, replacements = {}) {
        let text = this.translations[this.currentLanguage]?.[key] || 
                   this.translations.ru[key] || 
                   key;
        
        // Handle replacements
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        
        return text;
    },
    
    /**
     * Update all elements with data-i18n attribute
     */
    updatePageText() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.t(key);
            
            if (el.tagName === 'INPUT' || el.tagName === 'BUTTON') {
                el.value = value;
                el.textContent = value;
            } else if (el.placeholder !== undefined) {
                el.placeholder = value;
            } else {
                el.textContent = value;
            }
        });
    },
    
    /**
     * Load saved language
     */
    loadLanguage() {
        const saved = StorageUtils.getLocal('language');
        if (saved && CONFIG.LANGUAGES.includes(saved)) {
            this.currentLanguage = saved;
        }
        document.documentElement.lang = this.currentLanguage;
    }
};
