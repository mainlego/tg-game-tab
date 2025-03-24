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

        async initializeGame(userId) {
            if (!userId) {
                console.warn('No user ID provided for game initialization')
                return
            }

            try {
                console.log('Initializing game for user:', userId)

                // Загружаем настройки игры
                try {
                    const gameSettings = await GameSettingsService.getSettings()
                    console.log('Loaded game settings:', gameSettings)
                    this.gameSettings = gameSettings

                    // Применяем настройки
                    this.applyGameSettings(gameSettings)
                } catch (error) {
                    console.error('Error loading game settings:', error)
                }

                // Загружаем данные пользователя из базы
                const userData = await ApiService.getUser(userId)
                console.log('Loaded user data:', userData)

                if (userData?.gameData) {
                    // Всегда используем данные из базы как источник правды
                    this.loadFromState(userData.gameData)
                    // Сохраняем в localStorage для офлайн доступа
                    StorageService.saveState({
                        ...userData.gameData,
                        userId,
                        lastSaved: new Date().toISOString()
                    })
                }

                this.currentUser = userId
                this.processOfflineProgress()
                await this.saveState()

            } catch (error) {
                console.error('Error initializing game:', error)
                // Попробуем использовать данные из localStorage если есть
                const savedState = StorageService.loadState()
                if (savedState?.userId === userId) {
                    this.loadFromState(savedState)
                }
            }
        },

        resetState() {
            StorageService.clearState?.(); // если реализовано
            localStorage.removeItem('game'); // ручная очистка

            // Сброс состояния Pinia
            this.$reset();

            // Можно дополнительно перезагрузить страницу или вызвать init
            console.log('Прогресс сброшен');
        },

        async saveState() {
            if (!this.currentUser) {
                console.warn('Невозможно сохранить состояние: пользователь не определен');
                return false;
            }

            const now = Date.now();
            if (this._lastSaveTime && now - this._lastSaveTime < 2000) {
                console.log('Сохранение пропущено: слишком частый вызов');
                return false;
            }
            this._lastSaveTime = now;

            const stateToSave = {
                balance: this.balance,
                passiveIncome: this.passiveIncome,
                tutorialCompleted: this.tutorialCompleted,
                energy: this.energy,
                level: this.level,
                multipliers: this.multipliers,
                boosts: this.boosts,
                investments: this.investments,
                stats: this.stats,
                userId: this.currentUser,
                lastSaved: new Date().toISOString()
            };

            // Сохраняем локально
            StorageService.saveState(stateToSave);

            // Обновляем на сервере через ApiService
            try {
                const minimalData = {
                    gameData: {
                        balance: Number(this.balance) || 0,
                        passiveIncome: Number(this.passiveIncome) || 0,
                        level: {
                            current: Number(this.level.current) || 1,
                            title: String(this.level.title || 'Новичок')
                        },
                        investments: {
                            purchased: this.investments?.purchased?.map(i => i.id) || [],
                            activeIncome: Number(this.investments?.activeIncome) || 0
                        }
                    },
                    lastLogin: new Date().toISOString()
                };

                await ApiService.updateUser(this.currentUser, minimalData);
                console.log('Данные успешно обновлены на сервере');
                return true;
            } catch (error) {
                console.error('Ошибка обновления данных на сервере:', error);
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
            this.balance = state.balance || 0
            this.passiveIncome = state.passiveIncome || 0
            this.energy = state.energy || this.energy
            this.level = state.level || this.level
            this.multipliers = state.multipliers || this.multipliers
            this.boosts = state.boosts || this.boosts
            this.investments = state.investments || this.investments
            this.stats = state.stats || this.stats
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

        // Улучшенный метод processPassiveIncome для gameStore.js
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

        // Улучшенный метод startPassiveIncomeTimer
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

        handleTap() {
            if (this.canTap) {
                this.energy.current -= 1
                const reward = this.effectiveTapValue
                this.balance += reward
                this.stats.totalClicks++
                this.stats.totalEarned += reward
                this.saveState()
                return reward
            }
            return 0
        },

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

        // Улучшенный метод purchaseInvestment
        purchaseInvestment(investment, calculatedIncome) {
            if (this.balance < investment.cost) {
                return false;
            }

            this.balance -= investment.cost;

            // Используем множитель дохода из настроек
            const incomeMultiplier = this.multipliers.incomeBoost || 1;
            const adjustedIncome = calculatedIncome * incomeMultiplier;

            this.investments.purchased.push({
                id: investment.id,
                level: investment.level,
                income: adjustedIncome,
                purchaseDate: Date.now(),
                type: investment.type
            });

            const previousPassiveIncome = this.passiveIncome;
            this.passiveIncome += adjustedIncome;

            console.log(`[purchaseInvestment] Пассивный доход изменен: ${previousPassiveIncome} -> ${this.passiveIncome}`);

            // Пересчитываем инвестиции с актуальным доходом
            this.recalculateInvestmentIncome();

            // Принудительно обновляем уровень после изменения пассивного дохода
            this.updateLevel();

            // Сохраняем состояние
            this.saveState();
            return true;
        },

        recalculateInvestmentIncome() {
            // Запоминаем предыдущее значение дохода
            const previousIncome = this.passiveIncome;

            // Пересчитываем доход
            let totalIncome = 0;
            this.investments.purchased.forEach(investment => {
                totalIncome += investment.income;
            });

            this.passiveIncome = totalIncome;

            if (totalIncome > this.stats.maxPassiveIncome) {
                this.stats.maxPassiveIncome = totalIncome;
            }

            this.investments.activeIncome = totalIncome;
            this.investments.lastCalculation = Date.now();

            // Проверяем, изменился ли доход
            if (previousIncome !== totalIncome) {
                console.log(`[recalculateInvestmentIncome] Пассивный доход изменен: ${previousIncome} -> ${totalIncome}`);
                // Если доход изменился, обновляем уровень
                this.updateLevel();
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

        resetGame() {
            if (this.currentUser) {
                ApiService.resetUserProgress(this.currentUser)
                StorageService.clearState()
                this.resetToDefault()
            }
            window.location.reload()
        }
    }
})