// src/stores/gameStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StorageService } from '@/services/storage'
import { ApiService } from '@/services/apiService'
import { GameSettingsService } from '@/services/GameSettingsService'


export const useGameStore = defineStore('game', {
    state: () => {
        const currentUser = ref(null)
        const gameData = ref(null)
        const gameSettings = ref(null)

        // Пытаемся загрузить состояние из localStorage сразу
        const savedState = StorageService.loadState()
        if (savedState) {
            return {
                ...savedState,
                // Обновляем время для корректного расчета офлайн прогресса
                lastSaved: new Date().toISOString(),
                currentUser,
                gameData,
                gameSettings
            }
        }

        // Значения по умолчанию из GameSettingsService
        const tapValue = GameSettingsService.getSettingSync('tapValue', 1);
        const baseEnergy = GameSettingsService.getSettingSync('baseEnergy', 1000);
        const energyRegenRate = GameSettingsService.getSettingSync('energyRegenRate', 1);
        const incomeMultiplier = GameSettingsService.getSettingSync('incomeMultiplier', 1);
        const levelRequirements = GameSettingsService.getSettingSync('levelRequirements', [
            { level: 1, income: 0, title: 'Пацан' },
            { level: 2, income: 10000, title: 'Курьер' },
            { level: 3, income: 70000, title: 'Темщик' },
            { level: 4, income: 150000, title: 'Продавец' },
            { level: 5, income: 300000, title: 'Сотрудник' },
            { level: 6, income: 800000, title: 'Менеджер' },
            { level: 7, income: 1800000, title: 'Владелец' },
            { level: 8, income: 20000000, title: 'Аристократ' },
            { level: 9, income: 200000000, title: 'Инвестор' },
            { level: 10, income: 2500000000, title: 'Миллиардер' }
        ]);

        // Состояние пользователя
        return {
            // Основная валюта
            balance: 0,
            passiveIncome: 0,
            tutorialCompleted: false,

            // Система энергии
            energy: {
                current: baseEnergy,
                max: baseEnergy,
                regenRate: energyRegenRate,
                lastRegenTime: Date.now()
            },

            // Система уровней
            level: {
                current: 1,
                max: 10,
                progress: 0,
                title: levelRequirements.length > 0 ? levelRequirements[0].title : 'Пацан',
                levels: levelRequirements
            },

            // Множители и бусты
            multipliers: {
                tapValue: tapValue,
                tapMultiplier: 1,
                incomeBoost: incomeMultiplier
            },

            // Настройки бустов
            boostSettings: {
                tap3xCost: GameSettingsService.getSettingSync('boosts.tap3xCost', 8000),
                tap5xCost: GameSettingsService.getSettingSync('boosts.tap5xCost', 25000),
                duration: GameSettingsService.getSettingSync('boosts.duration', 24 * 60 * 60 * 1000)
            },

            // Активные бусты
            boosts: {
                tap3x: {
                    active: false,
                    endTime: null
                },
                tap5x: {
                    active: false,
                    endTime: null
                }
            },

            // Инвестиции
            investments: {
                purchased: [],
                activeIncome: 0,
                lastCalculation: Date.now()
            },

            // Статистика
            stats: {
                totalClicks: 0,
                totalEarned: 0,
                maxPassiveIncome: 0
            },

            // Данные пользователя и настройки игры
            currentUser,
            gameData,
            gameSettings
        }
    },

    getters: {
        formattedBalance: (state) => {
            return state.formatBigNumber(state.balance)
        },
        formattedPassiveIncome: (state) => {
            return '+' + state.formatBigNumber(state.passiveIncome) + '/мес'
        },
        formattedEnergy: (state) => {
            return `${Math.floor(state.energy.current)} / ${state.energy.max}`
        },
        effectiveTapValue: (state) => {
            return state.multipliers.tapValue * state.multipliers.tapMultiplier
        },
        canTap: (state) => {
            return state.energy.current >= 1
        }
    },

    actions: {
        completeTutorial() {
            this.tutorialCompleted = true
            this.saveState()
        },

        // Обновленный метод initializeGame
        async initializeGame(userId) {
            if (!userId) {
                console.warn('No user ID provided for game initialization');
                return;
            }

            try {
                console.log('Initializing game for user:', userId);

                // Загружаем настройки игры
                try {
                    const gameSettings = await GameSettingsService.getSettings();
                    console.log('Loaded game settings:', gameSettings);
                    this.gameSettings = gameSettings;

                    // Применяем настройки
                    this.applyGameSettings(gameSettings);
                } catch (error) {
                    console.error('Error loading game settings:', error);
                }

                // Загружаем данные пользователя из базы
                const userData = await ApiService.getUser(userId);
                console.log('Loaded user data from server:', userData);

                if (userData?.gameData) {
                    console.log('User data contains gameData with balance:', userData.gameData.balance);

                    // Всегда используем данные из базы как источник правды
                    this.loadFromState(userData.gameData);
                    console.log('After loading from server - Balance:', this.balance, 'Passive Income:', this.passiveIncome);

                    // Сохраняем в localStorage для офлайн доступа
                    const savedToLocal = StorageService.saveState({
                        ...userData.gameData,
                        userId,
                        lastSaved: new Date().toISOString()
                    });
                    console.log('Saved to localStorage:', savedToLocal ? 'success' : 'failed');
                } else {
                    console.warn('No gameData in user data or user data is empty');

                    // Попробуем использовать данные из localStorage если есть
                    const savedState = StorageService.loadState();
                    console.log('Checking localStorage for saved state:', savedState);

                    if (savedState?.userId === userId) {
                        console.log('Found matching state in localStorage with balance:', savedState.balance);
                        this.loadFromState(savedState);
                        console.log('After loading from localStorage - Balance:', this.balance);
                    } else {
                        console.warn('No matching state in localStorage or localStorage is empty');
                    }
                }

                this.currentUser = userId;
                this.processOfflineProgress();
                await this.saveState();

            } catch (error) {
                console.error('Error initializing game:', error);
                // Попробуем использовать данные из localStorage если есть
                const savedState = StorageService.loadState();
                if (savedState?.userId === userId) {
                    this.loadFromState(savedState);
                }
            }
        },

        resetState() {
            console.log('Сброс состояния...');

            // Используем правильный ключ для localStorage
            StorageService.clearState?.(); // Это вызовет очистку через StorageService
            localStorage.removeItem('gameState'); // Теперь используем правильный ключ

            // Сброс состояния Pinia
            this.$reset();

            console.log('Прогресс сброшен');
        },

        // Оригинальный метод saveState
        async saveState() {
            if (!this.currentUser) {
                console.warn('Невозможно сохранить состояние: пользователь не определен');
                return false;
            }

            // Экономим трафик и предотвращаем частые запросы
            const now = Date.now();
            if (this._lastSaveTime && now - this._lastSaveTime < 5000) { // Увеличим интервал до 5 секунд
                console.log('Сохранение пропущено: слишком частый вызов');
                return false;
            }
            this._lastSaveTime = now;

            console.log('Сохранение состояния. Текущий баланс:', this.balance, 'Пассивный доход:', this.passiveIncome);

            // Создаем упрощенную структуру для сохранения в БД
            const minimalData = {
                gameData: {
                    balance: Number(this.balance) || 0,
                    passiveIncome: Number(this.passiveIncome) || 0,
                    level: {
                        current: Number(this.level.current) || 1,
                        progress: Number(this.level.progress) || 0,
                        title: String(this.level.title || 'Новичок')
                    },
                    // Включаем важные статистические данные
                    stats: {
                        totalClicks: Number(this.stats.totalClicks) || 0,
                        totalEarned: Number(this.stats.totalEarned) || 0
                    }
                },
                lastLogin: new Date().toISOString()
            };

            // Создаем структуру для сохранения в localStorage
            const localStorageData = {
                balance: Number(this.balance) || 0,
                passiveIncome: Number(this.passiveIncome) || 0,
                energy: {
                    current: Number(this.energy.current) || 0,
                    max: Number(this.energy.max) || 1000,
                    regenRate: Number(this.energy.regenRate) || 1,
                    lastRegenTime: Number(this.energy.lastRegenTime) || Date.now()
                },
                level: {
                    current: Number(this.level.current) || 1,
                    max: Number(this.level.max) || 10,
                    progress: Number(this.level.progress) || 0,
                    title: String(this.level.title || 'Новичок'),
                    levels: this.level.levels || []
                },
                multipliers: this.multipliers,
                boosts: this.boosts,
                investments: {
                    purchased: this.investments.purchased,
                    activeIncome: Number(this.investments.activeIncome) || 0,
                    lastCalculation: Date.now()
                },
                stats: this.stats,
                userId: this.currentUser,
                lastSaved: new Date().toISOString()
            };

            // Сохраняем в localStorage
            const localSaved = StorageService.saveState(localStorageData);
            console.log('Сохранение в localStorage:', localSaved ? 'успешно' : 'ошибка', 'Баланс:', localStorageData.balance);

            // Сохраняем только самое необходимое на сервер
            try {
                // Используем прямой подход для простоты отладки
                const API_URL = 'https://tg-game-tab-server.onrender.com';
                const response = await fetch(`${API_URL}/api/admin/users/${this.currentUser}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(minimalData)
                });

                if (response.ok) {
                    console.log('Базовые данные успешно сохранены на сервере. Баланс:', minimalData.gameData.balance);
                    return true;
                } else {
                    const errorText = await response.text();
                    console.error('Ошибка сохранения:', errorText);
                    return false;
                }
            } catch (error) {
                console.error('Критическая ошибка при сохранении:', error);
                return false;
            }
        },

        // Добавляем метод saveGameData, который вызывается в purchaseInvestment
        async saveGameData() {
            // Сначала сохраняем в localStorage для надежности
            this.saveState();

            // Затем выполняем полное сохранение, которое включает данные инвестиций
            return this.fullSave();
        },

        async fullSave() {
            // Этот метод вызывается реже и сохраняет все данные, включая инвестиции
            if (!this.currentUser) return false;

            console.log('Выполняется полное сохранение данных. Текущий баланс:', this.balance);

            try {
                const fullData = {
                    gameData: {
                        balance: Number(this.balance) || 0,
                        passiveIncome: Number(this.passiveIncome) || 0,
                        energy: {
                            current: Number(this.energy.current) || 0,
                            max: Number(this.energy.max) || 1000,
                            regenRate: Number(this.energy.regenRate) || 1,
                            lastRegenTime: Number(this.energy.lastRegenTime) || Date.now()
                        },
                        level: {
                            current: Number(this.level.current) || 1,
                            progress: Number(this.level.progress) || 0,
                            title: String(this.level.title || 'Новичок')
                        },
                        investments: {
                            purchased: this.investments.purchased,
                            activeIncome: Number(this.investments.activeIncome) || 0,
                            lastCalculation: Date.now()
                        },
                        stats: this.stats
                    },
                    lastLogin: new Date().toISOString()
                };

                // Сохраняем также в localStorage
                StorageService.saveState({
                    balance: this.balance,
                    passiveIncome: this.passiveIncome,
                    energy: this.energy,
                    level: this.level,
                    multipliers: this.multipliers,
                    boosts: this.boosts,
                    investments: this.investments,
                    stats: this.stats,
                    userId: this.currentUser,
                    lastSaved: new Date().toISOString()
                });

                const API_URL = 'https://tg-game-tab-server.onrender.com';
                const response = await fetch(`${API_URL}/api/admin/users/${this.currentUser}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fullData)
                });

                if (response.ok) {
                    console.log('Полное сохранение успешно. Баланс:', fullData.gameData.balance);
                    return true;
                } else {
                    console.error('Ошибка полного сохранения');
                    return false;
                }
            } catch (error) {
                console.error('Ошибка полного сохранения:', error);
                return false;
            }
        },

        // Добавьте эту функцию в файл gameStore.js
        async directSaveBasics() {
            if (!this.currentUser) {
                console.warn('Невозможно сохранить данные: пользователь не определен');
                return false;
            }

            try {
                console.log('Выполняем прямое сохранение базовых данных...');

                // Супер-минимальный объект без investments
                const basicData = {
                    gameData: {
                        balance: Number(this.balance) || 0,
                        passiveIncome: Number(this.passiveIncome) || 0,
                        level: {
                            current: Number(this.level.current) || 1,
                            progress: Number(this.level.progress) || 0,
                            title: String(this.level.title || 'Новичок')
                        },
                        // Важно: НЕ включаем investments вообще
                    },
                    lastLogin: new Date().toISOString()
                };

                // Прямой запрос к серверу, минуя ApiService
                const response = await fetch('https://tg-game-tab-server.onrender.com/api/admin/users/' + this.currentUser, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(basicData)
                });

                // Проверяем ответ
                if (response.ok) {
                    console.log('Базовые данные успешно сохранены через прямой запрос');
                    return true;
                } else {
                    const errorText = await response.text();
                    console.error('Ошибка прямого сохранения:', errorText);
                    return false;
                }
            } catch (error) {
                console.error('Критическая ошибка при прямом сохранении:', error);
                return false;
            }
        },

        loadFromState(state) {
            console.log('Loading state with data:', state);

            // Устанавливаем значения с проверкой типов
            this.balance = Number(state.balance) || 0;
            this.passiveIncome = Number(state.passiveIncome) || 0;

            // Обновляем остальные данные, если они есть
            if (state.energy) {
                this.energy = {
                    current: Number(state.energy.current) || this.energy.current,
                    max: Number(state.energy.max) || this.energy.max,
                    regenRate: Number(state.energy.regenRate) || this.energy.regenRate,
                    lastRegenTime: Number(state.energy.lastRegenTime) || Date.now()
                };
            }

            if (state.level) {
                this.level = {
                    current: Number(state.level.current) || this.level.current,
                    max: Number(state.level.max) || this.level.max,
                    progress: Number(state.level.progress) || this.level.progress,
                    title: state.level.title || this.level.title,
                    levels: state.level.levels || this.level.levels
                };
            }

            if (state.multipliers) this.multipliers = state.multipliers;
            if (state.boosts) this.boosts = state.boosts;
            if (state.investments) this.investments = state.investments;
            if (state.stats) this.stats = state.stats;

            console.log('State loaded successfully, balance:', this.balance, 'passive income:', this.passiveIncome);
        },

        resetToDefault() {
            const baseEnergy = GameSettingsService.getSettingSync('baseEnergy', 1000);
            const tapValue = GameSettingsService.getSettingSync('tapValue', 1);
            const levelRequirements = GameSettingsService.getSettingSync('levelRequirements', []);

            this.balance = 0
            this.passiveIncome = 0
            this.energy = {
                current: baseEnergy,
                max: baseEnergy,
                regenRate: GameSettingsService.getSettingSync('energyRegenRate', 1),
                lastRegenTime: Date.now()
            }
            this.level = {
                current: 1,
                max: 10,
                progress: 0,
                title: levelRequirements.length > 0 ? levelRequirements[0].title : 'Пацан',
                levels: levelRequirements
            }
            this.multipliers = {
                tapValue: tapValue,
                tapMultiplier: 1,
                incomeBoost: GameSettingsService.getSettingSync('incomeMultiplier', 1)
            }
            this.boosts = {
                tap3x: { active: false, endTime: null },
                tap5x: { active: false, endTime: null }
            }
            this.investments = {
                purchased: [],
                activeIncome: 0,
                lastCalculation: Date.now()
            }
            this.stats = {
                totalClicks: 0,
                totalEarned: 0,
                maxPassiveIncome: 0
            }
        },

        // Применение настроек из API
        applyGameSettings(settings) {
            if (!settings) return

            // Применяем основные настройки
            if (settings.tapValue !== undefined) {
                this.multipliers.tapValue = settings.tapValue
            }

            if (settings.baseEnergy !== undefined) {
                // Только если у пользователя нет кастомного значения энергии
                const isDefaultEnergy = this.energy.max === 1000 ||
                    this.energy.max === GameSettingsService._defaultSettings.baseEnergy

                if (isDefaultEnergy) {
                    const oldMax = this.energy.max
                    this.energy.max = settings.baseEnergy

                    // Масштабируем текущую энергию пропорционально новому максимуму
                    if (oldMax > 0) {
                        const ratio = this.energy.current / oldMax
                        this.energy.current = Math.min(this.energy.max, Math.round(settings.baseEnergy * ratio))
                    } else {
                        this.energy.current = Math.min(this.energy.current, settings.baseEnergy)
                    }
                }
            }

            if (settings.energyRegenRate !== undefined) {
                this.energy.regenRate = settings.energyRegenRate
            }

            if (settings.incomeMultiplier !== undefined) {
                this.multipliers.incomeBoost = settings.incomeMultiplier
            }

            // Применяем настройки бустов
            if (settings.boosts) {
                this.boostSettings = {
                    ...this.boostSettings,
                    ...settings.boosts
                }
            }

            // Применяем уровни, если они определены в настройках
            if (settings.levelRequirements && settings.levelRequirements.length > 0) {
                this.level.levels = settings.levelRequirements
                // Обновляем текущий уровень и заголовок на основе новых требований
                this.updateLevel()
            }
        },

        formatBigNumber(num) {
            if (num >= 1000000000) {
                return (num / 1000000000).toFixed(1) + 'B'
            }
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M'
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K'
            }
            return Math.floor(num).toString()
        },

        // Оригинальный метод processPassiveIncome
        processPassiveIncome() {
            if (this.passiveIncome > 0) {
                const monthInSeconds = 30 * 24 * 60 * 60;
                const incomePerSecond = this.passiveIncome / monthInSeconds;

                // Сохраняем предыдущее значение для проверки изменения
                const previousBalance = this.balance;

                // Начисляем доход (10 раз в секунду)
                this.balance += (incomePerSecond / 10);

                // Периодически обновляем уровень, но не каждый тик для производительности
                // Обновляем каждые 5 секунд или при значительном изменении баланса
                const now = Date.now();
                if (!this._lastPassiveUpdate ||
                    now - this._lastPassiveUpdate > 5000 ||
                    Math.abs(this.balance - previousBalance) > 1000) {

                    this.updateLevel();
                    this._lastPassiveUpdate = now;
                }
            }
        },

        // Оригинальный метод startPassiveIncomeTimer
        startPassiveIncomeTimer() {
            // Сразу вызываем updateLevel при запуске таймера
            this.updateLevel();

            // Запускаем обработку пассивного дохода 10 раз в секунду
            setInterval(() => {
                this.processPassiveIncome();
            }, 100);

            // Дополнительно принудительно обновляем уровень каждые 10 секунд
            // для гарантии актуальности данных
            setInterval(() => {
                this.updateLevel();
            }, 10000);
        },

        // Оригинальный метод handleTap
        handleTap() {
            if (this.canTap) {
                this.energy.current -= 1;
                const reward = this.effectiveTapValue;

                // Явно обновляем баланс
                this.balance += reward;
                console.log('Баланс после тапа:', this.balance);

                this.stats.totalClicks++;
                this.stats.totalEarned += reward;

                // Сохраняем состояние
                this.saveState();

                return reward;
            }
            return 0;
        },

        // Оригинальный метод regenerateEnergy
        regenerateEnergy() {
            const now = Date.now()
            const deltaTime = (now - this.energy.lastRegenTime) / 1000

            if (this.energy.current < this.energy.max) {
                this.energy.current = Math.min(
                    this.energy.max,
                    this.energy.current + (this.energy.regenRate * deltaTime)
                )
                this.energy.lastRegenTime = now
                this.saveState()
            }
        },

        applyBoost(type, customDuration = null) {
            const now = Date.now()
            // Используем продолжительность из настроек или предоставленную продолжительность
            const duration = customDuration || this.boostSettings?.duration || 24 * 60 * 60 * 1000
            const endTime = now + duration

            switch(type) {
                case 'tap3x':
                    this.multipliers.tapMultiplier = 3
                    this.boosts.tap3x.active = true
                    this.boosts.tap3x.endTime = endTime
                    break
                case 'tap5x':
                    this.multipliers.tapMultiplier = 5
                    this.boosts.tap5x.active = true
                    this.boosts.tap5x.endTime = endTime
                    break
            }

            setTimeout(() => {
                this.removeBoost(type)
            }, duration)

            this.saveState()
        },

        removeBoost(type) {
            switch(type) {
                case 'tap3x':
                    this.boosts.tap3x.active = false
                    this.boosts.tap3x.endTime = null
                    break
                case 'tap5x':
                    this.boosts.tap5x.active = false
                    this.boosts.tap5x.endTime = null
                    break
            }

            if (!this.boosts.tap3x.active && !this.boosts.tap5x.active) {
                this.multipliers.tapMultiplier = 1
            }

            this.saveState()
        },

        upgradeEnergy(newMax) {
            this.energy.max = newMax
            this.energy.current = newMax
            this.saveState()
        },

        // Получение стоимости буста из настроек
        getBoostCost(type) {
            if (type === 'tap3x') {
                return this.boostSettings?.tap3xCost || 8000
            }
            if (type === 'tap5x') {
                return this.boostSettings?.tap5xCost || 25000
            }
            return 0
        },

        // Функция для расчета следующей стоимости инвестиции
        calculateNextCost(investment) {
            // Базовая стоимость
            const baseCost = investment.cost || 0;
            // Коэффициент роста цены (можно настроить)
            const costMultiplier = investment.costMultiplier || 1.5;
            // Текущий уровень
            const currentLevel = investment.level || 1;
            // Рассчитываем стоимость для следующего уровня
            return Math.round(baseCost * Math.pow(costMultiplier, 1));
        },

        // Исправленный метод purchaseInvestment с использованием saveGameData
        purchaseInvestment(investment, income) {
            try {
                // Проверка наличия необходимой суммы на балансе
                if (this.balance < investment.cost) {
                    return false;
                }

                // Явно устанавливаем доход для инвестиции, если он передан
                const calculatedIncome = income || investment.income || investment.baseIncome || 0;

                // Создаем идентификатор инвестиции
                const investmentKey = `${investment.type}_${investment.id}`;

                // Проверяем, есть ли у нас уже такая инвестиция
                const existingIndex = this.investments.purchased.findIndex(
                    item => `${item.type}_${item.id}` === investmentKey
                );

                if (existingIndex >= 0) {
                    // Обновляем существующую инвестицию
                    this.investments.purchased[existingIndex] = {
                        ...investment,
                        income: calculatedIncome, // Устанавливаем доход явно
                        // Сохраняем новую стоимость для следующего уровня
                        cost: investment.nextCost || this.calculateNextCost(investment)
                    };
                } else {
                    // Добавляем новую инвестицию
                    this.investments.purchased.push({
                        ...investment,
                        income: calculatedIncome, // Устанавливаем доход явно
                        // Сохраняем новую стоимость для следующего уровня
                        cost: investment.nextCost || this.calculateNextCost(investment)
                    });
                }

                // Обновляем общий пассивный доход
                this.recalculateInvestmentIncome();

                // Списываем средства с баланса
                this.balance -= investment.cost;

                // Сохраняем изменения используя метод saveGameData
                this.saveGameData();

                return true;
            } catch (error) {
                console.error('Ошибка при покупке инвестиции:', error);
                return false;
            }
        },

        recalculateInvestmentIncome() {
            // Запоминаем предыдущее значение дохода
            const previousIncome = this.passiveIncome;

            // Пересчитываем доход
            let totalIncome = 0;
            if (this.investments && Array.isArray(this.investments.purchased)) {
                this.investments.purchased.forEach(investment => {
                    if (investment && typeof investment.income === 'number') {
                        totalIncome += investment.income;
                    } else if (investment && investment.baseIncome) {
                        // Если нет поля income, но есть baseIncome
                        totalIncome += investment.baseIncome;
                    }
                });
            }

            // Обновляем пассивный доход
            this.passiveIncome = totalIncome;

            // Обновляем статистику
            if (totalIncome > this.stats.maxPassiveIncome) {
                this.stats.maxPassiveIncome = totalIncome;
            }

            // Обновляем данные инвестиций
            this.investments.activeIncome = totalIncome;
            this.investments.lastCalculation = Date.now();

            // Проверяем, изменился ли доход
            if (previousIncome !== totalIncome) {
                console.log(`[recalculateInvestmentIncome] Пассивный доход изменен: ${previousIncome} -> ${totalIncome}`);
                // Если доход изменился, обновляем уровень
                this.updateLevel();
            }

            // Принудительно вызываем сохранение, если доход изменился
            if (previousIncome !== totalIncome) {
                this.saveState();
            }
        },

        // Исправленный метод updateLevel()
        // Проблема может быть здесь, в методе updateLevel
        // Улучшенный метод updateLevel для gameStore.js
        updateLevel() {
            try {
                // Проверка на наличие данных об уровнях
                if (!this.level.levels || !Array.isArray(this.level.levels) || this.level.levels.length === 0) {
                    console.warn('Отсутствуют данные об уровнях или некорректный формат, невозможно обновить уровень');
                    this.level.progress = 0; // Сбрасываем прогресс в случае ошибки
                    return;
                }

                console.log(`[updateLevel] Начато обновление уровня. Пассивный доход: ${this.passiveIncome}`);

                // Устанавливаем максимальный уровень
                this.level.max = this.level.levels.length;

                // Определяем текущий уровень на основе пассивного дохода
                let newLevel = 1;
                let currentLevelIndex = 0;

                // Перебираем все уровни и находим последний, требования которого выполнены
                for (let i = 0; i < this.level.levels.length; i++) {
                    // Защита от некорректных данных
                    if (!this.level.levels[i] || typeof this.level.levels[i].income !== 'number') {
                        console.warn(`[updateLevel] Некорректные данные уровня ${i+1}:`, this.level.levels[i]);
                        continue;
                    }

                    if (this.passiveIncome >= this.level.levels[i].income) {
                        newLevel = i + 1;
                        currentLevelIndex = i;
                    } else {
                        // Прерываем цикл, как только найден первый непройденный порог
                        break;
                    }
                }

                // Обновляем текущий уровень и заголовок, если уровень изменился
                if (newLevel !== this.level.current) {
                    console.log(`[updateLevel] Уровень изменен: ${this.level.current} -> ${newLevel} (${this.level.levels[currentLevelIndex].title})`);
                    this.level.current = newLevel;

                    // Проверка наличия заголовка
                    if (this.level.levels[currentLevelIndex] && this.level.levels[currentLevelIndex].title) {
                        this.level.title = this.level.levels[currentLevelIndex].title;
                    } else {
                        this.level.title = `Уровень ${newLevel}`;
                    }
                }

                // Расчет прогресса до следующего уровня
                // Если это не максимальный уровень
                if (newLevel < this.level.levels.length) {
                    // Защита от выхода за границы массива
                    if (currentLevelIndex >= 0 && currentLevelIndex + 1 < this.level.levels.length) {
                        const currentThreshold = this.level.levels[currentLevelIndex].income;
                        const nextThreshold = this.level.levels[currentLevelIndex + 1].income;
                        const range = nextThreshold - currentThreshold;

                        console.log(`[updateLevel] Расчет прогресса: доход ${this.passiveIncome}, порог текущего уровня ${currentThreshold}, порог следующего уровня ${nextThreshold}`);

                        // Проверка на корректность порогов
                        if (range <= 0) {
                            console.warn('[updateLevel] Ошибка в порогах уровней: текущий >= следующий');
                            this.level.progress = 0;
                        } else {
                            // Расчет процента прогресса
                            const rawProgress = ((this.passiveIncome - currentThreshold) / range) * 100;
                            // Ограничиваем значение от 0 до 100
                            this.level.progress = Math.min(Math.max(rawProgress, 0), 100);
                            console.log(`[updateLevel] Рассчитанный прогресс: ${this.level.progress.toFixed(2)}%`);
                        }
                    } else {
                        console.warn('[updateLevel] Индекс уровня вне диапазона:', currentLevelIndex);
                        this.level.progress = 0;
                    }
                } else {
                    // Если достигнут максимальный уровень
                    this.level.progress = 100;
                    console.log('[updateLevel] Достигнут максимальный уровень, прогресс установлен на 100%');
                }

                // Гарантируем, что прогресс - валидное число
                if (isNaN(this.level.progress) || this.level.progress === undefined) {
                    console.warn('[updateLevel] Прогресс имеет невалидное значение, сбрасываем на 0');
                    this.level.progress = 0;
                }

                // Сохраняем обновленное состояние, но с ограничением частоты вызовов
                // Для обновления уровня используем отдельный таймер, чтобы не конфликтовать с другими saveState вызовами
                const now = Date.now();
                if (!this._lastLevelUpdateSave || now - this._lastLevelUpdateSave > 3000) {
                    console.log(`[updateLevel] Сохраняем состояние: уровень ${this.level.current}, прогресс ${this.level.progress}%`);
                    this._lastLevelUpdateSave = now;
                    this.saveState();
                } else {
                    console.log(`[updateLevel] Пропускаем сохранение из-за частых вызовов`);
                }
            } catch (error) {
                console.error('[updateLevel] Ошибка при обновлении уровня:', error);
                // Пытаемся восстановить корректное состояние
                if (!this.level.current || isNaN(this.level.current)) {
                    this.level.current = 1;
                }
                if (!this.level.progress || isNaN(this.level.progress)) {
                    this.level.progress = 0;
                }
            }
        },


        processOfflineProgress() {
            const now = Date.now()
            const lastUpdate = this.investments.lastCalculation
            const offlineTime = (now - lastUpdate) / 1000

            // Начисляем офлайн доход
            const offlineIncome = Math.floor((this.passiveIncome / (30 * 24 * 60 * 60)) * offlineTime)
            if (offlineIncome > 0) {
                this.balance += offlineIncome
            }

            // Восстанавливаем энергию
            this.energy.current = this.energy.max
            this.energy.lastRegenTime = now

            // Проверяем бусты
            Object.keys(this.boosts).forEach(boostKey => {
                const boost = this.boosts[boostKey]
                if (boost.active && boost.endTime < now) {
                    this.removeBoost(boostKey)
                }
            })

            this.investments.lastCalculation = now
            this.saveState()

            return {
                time: Math.floor(offlineTime),
                income: offlineIncome
            }
        },

        // Улучшенный метод resetGame() для обеспечения полной очистки данных
        resetGame() {
            console.log('Запуск полного сброса прогресса...');

            try {
                // 1. Сначала очищаем все данные в localStorage
                StorageService.clearState?.();
                localStorage.removeItem('gameState'); // Теперь используем правильный ключ
                localStorage.removeItem('preloadedGameSettings');

                // 2. Сбрасываем состояние хранилища
                this.$reset();

                // 3. Если пользователь авторизован, отправляем запрос на сервер для сброса прогресса
                if (this.currentUser) {
                    try {
                        ApiService.resetUserProgress(this.currentUser);
                        console.log('Отправлен запрос на сброс данных на сервере');
                    } catch (e) {
                        console.error('Ошибка при сбросе данных на сервере:', e);
                        // Продолжаем сброс локальных данных даже при ошибке на сервере
                    }
                }

                console.log('Прогресс успешно сброшен. Перезагрузка страницы...');
            } catch (e) {
                console.error('Ошибка при сбросе прогресса:', e);
            }

            // 5. Перезагружаем страницу для применения изменений
            window.location.reload();
        }
    }
})