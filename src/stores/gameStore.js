// src/stores/gameStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StorageService } from '@/services/storage'
import { UserService } from '@/services/userService'

export const useGameStore = defineStore('game', {
    state: () => {
        // Состояние пользователя
        const currentUser = ref(null)
        const gameData = ref(null)

        return {
            // Основная валюта
            balance: 0,
            passiveIncome: 0,

            // Система энергии
            energy: {
                current: 1000,
                max: 1000,
                regenRate: 1,
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
                lastCalculation: Date.now()
            },

            // Статистика
            stats: {
                totalClicks: 0,
                totalEarned: 0,
                maxPassiveIncome: 0
            },

            // Данные пользователя
            currentUser,
            gameData
        }
    },

    getters: {
        // Форматированный баланс
        formattedBalance: (state) => {
            return state.formatBigNumber(state.balance)
        },

        // Форматированный пассивный доход
        formattedPassiveIncome: (state) => {
            return '+' + state.formatBigNumber(state.passiveIncome) + '/мес'
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
        }
    },

    actions: {
        // Инициализация игры для пользователя
        initializeGame(userId) {
            if (!userId) {
                console.warn('No user ID provided for game initialization')
                return
            }

            const userData = UserService.getUser(userId)
            if (userData) {
                this.currentUser = userData
                const data = userData.gameData

                if (data) {
                    // Загружаем сохраненные данные
                    this.balance = data.balance || 0
                    this.passiveIncome = data.passiveIncome || 0
                    this.energy = data.energy || this.energy
                    this.level = data.level || this.level
                    this.multipliers = data.multipliers || this.multipliers
                    this.boosts = data.boosts || this.boosts
                    this.investments = data.investments || this.investments
                    this.stats = data.stats || this.stats
                }

                // Обрабатываем офлайн прогресс
                this.processOfflineProgress()
            }
        },

        // Сохранение состояния
        saveState() {
            if (this.currentUser?.id) {
                const gameData = {
                    balance: this.balance,
                    passiveIncome: this.passiveIncome,
                    energy: this.energy,
                    level: this.level,
                    multipliers: this.multipliers,
                    boosts: this.boosts,
                    investments: this.investments,
                    stats: this.stats
                }
                UserService.updateGameData(this.currentUser.id, gameData)
            }
        },

        // Форматирование больших чисел
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

        // Обработка пассивного дохода
        processPassiveIncome() {
            if (this.passiveIncome > 0) {
                const monthInSeconds = 30 * 24 * 60 * 60
                const incomePerSecond = this.passiveIncome / monthInSeconds
                this.balance += (incomePerSecond / 10)
                this.updateLevel()
                this.saveState()
            }
        },

        // Запуск таймера пассивного дохода
        startPassiveIncomeTimer() {
            setInterval(() => {
                this.processPassiveIncome()
            }, 100)
        },

        // Обработка клика
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
                return false
            }

            this.balance -= investment.cost

            this.investments.purchased.push({
                id: investment.id,
                level: investment.level,
                income: calculatedIncome,
                purchaseDate: Date.now(),
                type: investment.type
            })

            this.passiveIncome += calculatedIncome
            this.recalculateInvestmentIncome()
            this.saveState()
            return true
        },

        // Пересчет дохода от инвестиций
        recalculateInvestmentIncome() {
            let totalIncome = 0
            this.investments.purchased.forEach(investment => {
                totalIncome += investment.income
            })

            this.passiveIncome = totalIncome

            if (totalIncome > this.stats.maxPassiveIncome) {
                this.stats.maxPassiveIncome = totalIncome
            }

            this.investments.activeIncome = totalIncome
            this.investments.lastCalculation = Date.now()
            this.updateLevel()
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

        // Сброс игры
        resetGame() {
            if (this.currentUser?.id) {
                UserService.resetUserProgress(this.currentUser.id)
            }
            window.location.reload()
        }
    }
})