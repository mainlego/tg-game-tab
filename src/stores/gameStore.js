// src/stores/gameStore.js
import { defineStore } from 'pinia'
import { StorageService } from '@/services/storage'

export const useGameStore = defineStore('game', {
    state: () => {
        const savedState = StorageService.loadState()
        const initialState = {
            // Основная валюта
            balance: 0,

            // Пассивный доход
            passiveIncome: 0,

            // Система энергии
            energy: {
                current: 1000,
                max: 1000,
                regenRate: 1, // энергия в секунду
                lastRegenTime: Date.now()
            },

            // Система уровней
            level: {
                current: 1,
                max: 10,
                progress: 0,
                title: 'Пацан',
                levels: [
                    { income: 0, title: 'Пацан' },
                    { income: 10000, title: 'Курьер' },
                    { income: 70000, title: 'Темщик' },
                    { income: 150000, title: 'Продавец' },
                    { income: 300000, title: 'Сотрудник' },
                    { income: 800000, title: 'Менеджер' },
                    { income: 1800000, title: 'Владелец' },
                    { income: 20000000, title: 'Аристократ' },
                    { income: 200000000, title: 'Инвестор' },
                    { income: 2500000000, title: 'Миллиардер' }
                ]
            },

            // Множители и бусты
            multipliers: {
                tapValue: 1,
                tapMultiplier: 1,
                incomeBoost: 1
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
                lastCalculation: Date.now(),
            },

            // Статистика
            stats: {
                totalClicks: 0,
                totalEarned: 0,
                maxPassiveIncome: 0
            },

            lastUpdate: Date.now()
        }

        // Объединяем сохраненное состояние с начальным, гарантируя наличие всех необходимых полей
        return savedState ? { ...initialState, ...savedState } : initialState
    },

    getters: {
        // Форматированный баланс
        formattedBalance: (state) => {
            return formatBigNumber(state.balance)
        },

        // Форматированный пассивный доход
        formattedPassiveIncome: (state) => {
            return '+' + formatBigNumber(state.passiveIncome) + '/мес'
        },

        // Форматированная энергия
        formattedEnergy: (state) => {
            return `${Math.floor(state.energy.current)} / ${state.energy.max}`
        },

        // Эффективность клика
        effectiveTapValue: (state) => {
            return state.multipliers.tapValue * state.multipliers.tapMultiplier
        },

        // Возможность клика
        canTap: (state) => {
            return state.energy.current >= 1
        },

        // Активные инвестиции
        activeInvestments: (state) => {
            return state.investments.purchased
        },

        // Общий доход от инвестиций
        totalInvestmentIncome: (state) => {
            return state.investments.activeIncome
        },

        // Проверка покупки инвестиции
        isInvestmentPurchased: (state) => (investmentId) => {
            return state.investments.purchased.some(inv => inv.id === investmentId)
        }
    },

    actions: {
        // Сохранение состояния
        saveState() {
            StorageService.saveState({
                ...this.$state,
                lastUpdate: Date.now()
            })
        },

        // Добавим новый метод для обработки пассивного дохода
        processPassiveIncome() {
            const now = Date.now()
            const deltaTime = (now - this.lastUpdate) / 1000 // разница в секундах

            // Рассчитываем доход за секунду (конвертируем месячный доход в секундный)
            const incomePerSecond = this.passiveIncome / (30 * 24 * 60 * 60)

            // Начисляем доход
            const income = Math.floor(incomePerSecond * deltaTime)
            if (income > 0) {
                this.balance += income
            }

            this.lastUpdate = now
            this.saveState()
        },

        // Добавим метод для запуска таймера
        startPassiveIncomeTimer() {
            setInterval(() => {
                if (this.passiveIncome > 0) {
                    // Конвертируем месячный доход в секундный
                    const monthInSeconds = 30 * 24 * 60 * 60;
                    const incomePerSecond = this.passiveIncome / monthInSeconds;

                    // Прибавляем доход за 100мс
                    this.balance += (incomePerSecond / 10);
                    this.updateLevel(); // Обновляем уровень при изменении баланса
                    this.saveState(); // Сохраняем состояние
                }
            }, 100); // Обновляем каждые 100мс для более плавной анимации
        },


        // Обработка клика
        handleTap() {
            if (this.canTap) {
                this.energy.current -= 1
                const reward = this.effectiveTapValue
                this.balance += reward

                // Добавляем проверку
                if (!this.stats) {
                    this.stats = {
                        totalClicks: 0,
                        totalEarned: 0,
                        maxPassiveIncome: 0
                    }
                }

                this.stats.totalClicks++
                this.stats.totalEarned += reward
                this.saveState()
                return reward
            }
            return 0
        },

        // Регенерация энергии
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

        // Применение буста
        applyBoost(type, duration) {
            const now = Date.now()
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

        // Удаление буста
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

        // Апгрейд энергии
        upgradeEnergy(newMax) {
            this.energy.max = newMax
            this.energy.current = newMax
            this.saveState()
        },

        // Покупка инвестиции
        purchaseInvestment(investment, calculatedIncome) {
            if (this.balance < investment.cost) {
                return false;
            }

            // Проверяем и инициализируем структуру, если она отсутствует
            if (!this.investments) {
                this.investments = {
                    purchased: [],
                    activeIncome: 0,
                    lastCalculation: Date.now()
                }
            }

            this.balance -= investment.cost;

            this.investments.purchased.push({
                id: investment.id,
                level: investment.level,
                income: calculatedIncome,
                purchaseDate: Date.now(),
                type: investment.type
            });

            this.passiveIncome += calculatedIncome; // Добавляем пассивный доход сразу
            this.recalculateInvestmentIncome();
            this.saveState();
            return true;
        },

        // Пересчет дохода от инвестиций
        recalculateInvestmentIncome() {
            if (!this.investments) {
                this.investments = {
                    purchased: [],
                    activeIncome: 0,
                    lastCalculation: Date.now()
                }
                return;
            }

            const now = Date.now();
            const timePassed = (now - this.investments.lastCalculation) / 1000;

            let totalIncome = 0;
            this.investments.purchased.forEach(investment => {
                totalIncome += investment.income;
            });

            this.passiveIncome = totalIncome;

            if (timePassed > 0) {
                const earnedIncome = (totalIncome / (30 * 24 * 60 * 60)) * timePassed;
                this.balance += Math.floor(earnedIncome);
            }

            if (totalIncome > this.stats.maxPassiveIncome) {
                this.stats.maxPassiveIncome = totalIncome;
            }

            this.investments.activeIncome = totalIncome;
            this.investments.lastCalculation = now;
            this.updateLevel();
        },

        // Обновление уровня
        updateLevel() {
            let newLevel = 1
            for (let i = 0; i < this.level.levels.length; i++) {
                if (this.passiveIncome >= this.level.levels[i].income) {
                    newLevel = i + 1
                }
            }

            if (newLevel !== this.level.current) {
                this.level.current = newLevel
                this.level.title = this.level.levels[newLevel - 1].title
            }

            // Расчет прогресса
            if (newLevel < this.level.levels.length) {
                const currentMin = this.level.levels[newLevel - 1].income
                const nextMin = this.level.levels[newLevel].income
                const progress = ((this.passiveIncome - currentMin) / (nextMin - currentMin)) * 100
                this.level.progress = Math.min(Math.max(progress, 0), 100)
            } else {
                this.level.progress = 100
            }
        },

        // Обработка офлайн прогресса
        processOfflineProgress() {
            const now = Date.now()
            const offlineTime = (now - this.lastUpdate) / 1000

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

            this.lastUpdate = now
            this.saveState()

            return {
                time: Math.floor(offlineTime),
                income: offlineIncome
            }
        },

        // Сброс игры
        resetGame() {
            StorageService.clearState()
            window.location.reload()
        }
    }
})

// Форматирование больших чисел
function formatBigNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default useGameStore