// Configuration and balance constants

const CONFIG = {
    DEBUG: true,
    
    // Game
    AUTO_SAVE_INTERVAL: 15000, // 15 seconds
    CLOUD_SYNC_INTERVAL: 60000, // 60 seconds
    OFFLINE_INCOME_LIMIT: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    
    // Click mechanics
    INITIAL_CLICK_POWER: 1,
    INITIAL_EPS: 0,
    
    // Upgrades balance
    UPGRADES: {
        clickPower: {
            name: 'upgrades.clickPower',
            desc: 'upgrades.clickPowerDesc',
            basePrice: 10,
            priceMultiplier: 1.2,
            baseEffect: 1,
            effectMultiplier: 1.15,
            icon: '⚡'
        },
        eps: {
            name: 'upgrades.eps',
            desc: 'upgrades.epsDesc',
            basePrice: 50,
            priceMultiplier: 1.25,
            baseEffect: 0.5,
            effectMultiplier: 1.2,
            icon: '⚙️'
        },
        multiplier: {
            name: 'upgrades.multiplier',
            desc: 'upgrades.multiplierDesc',
            basePrice: 500,
            priceMultiplier: 1.4,
            baseEffect: 1.05,
            effectMultiplier: 1.03,
            icon: '🔱'
        }
    },
    
    // Shop items (purchasable generators/clickers)
    SHOP_ITEMS: {
        basicClicker: {
            id: 'basicClicker',
            name: 'shop.basicClicker',
            desc: 'shop.basicClickerDesc',
            icon: '👆',
            basePrice: 100,
            priceMultiplier: 1.15,
            baseIncome: 1,
            effectMultiplier: 1.1,
            type: 'clicker'
        },
        autoClicker: {
            id: 'autoClicker',
            name: 'shop.autoClicker',
            desc: 'shop.autoClickerDesc',
            icon: '🤖',
            basePrice: 500,
            priceMultiplier: 1.2,
            baseIncome: 5,
            effectMultiplier: 1.15,
            type: 'generator'
        },
        miningRig: {
            id: 'miningRig',
            name: 'shop.miningRig',
            desc: 'shop.miningRigDesc',
            icon: '⛏️',
            basePrice: 2000,
            priceMultiplier: 1.25,
            baseIncome: 25,
            effectMultiplier: 1.2,
            type: 'generator'
        },
        quantumGenerator: {
            id: 'quantumGenerator',
            name: 'shop.quantumGenerator',
            desc: 'shop.quantumGeneratorDesc',
            icon: '⚛️',
            basePrice: 10000,
            priceMultiplier: 1.3,
            baseIncome: 150,
            effectMultiplier: 1.25,
            type: 'generator'
        },
        galaxyForge: {
            id: 'galaxyForge',
            name: 'shop.galaxyForge',
            desc: 'shop.galaxyForgeDesc',
            icon: '🌌',
            basePrice: 50000,
            priceMultiplier: 1.35,
            baseIncome: 1000,
            effectMultiplier: 1.3,
            type: 'generator'
        }
    },
    
    // Prestige
    PRESTIGE: {
        threshold: 1e6, // 1 million energy to prestige
        thresholdGrowth: 1.5, // multiply threshold by this each prestige
        pointsFormula: (totalEarned, threshold) => Math.floor(Math.sqrt(totalEarned / threshold)),
        bonusPerPoint: 0.02, // 2% per prestige point
        icon: '✨'
    },
    
    // Advertisement
    AD: {
        interstitialCooldown: 3 * 60 * 1000, // 3 minutes between interstitials
        rewardedBonus: {
            type: 'multiplier', // 'multiplier', 'offline', or 'instant'
            multiplier: 2,
            duration: 60 * 1000 // 60 seconds
        }
    },
    
    // Leaderboard
    LEADERBOARD: {
        id: 'score1234', // CHANGE THIS to your Yandex Leaderboard ID
        updateDebounce: 5000, // min 5 seconds between updates
    },
    
    // UI
    UI: {
        numberFormat: 'compact', // 'compact' (1.2K) or 'full' (1200)
        animationDuration: 300,
    },
    
    // Localization
    LANGUAGES: ['ru', 'en'],
    DEFAULT_LANGUAGE: 'ru',
    
    // Save version
    SAVE_VERSION: 2
};

function logDebug(...args) {
    if (CONFIG.DEBUG) {
        console.log('[OrbitClicker]', ...args);
    }
}

function logError(...args) {
    console.error('[OrbitClicker]', ...args);
}
