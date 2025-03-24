// src/stores/gameStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StorageService } from '@/services/storage'
import { ApiService } from '@/services/apiService'

export const useGameStore = defineStore('game', {
    state: () => {


        const currentUser = ref(null)
        const gameData = ref(null)

        // Пытаемся загрузить состояние из localStorage сразу
        const savedState = StorageService.loadState()
        if (savedState) {
            return {
                ...savedState,
                // Обновляем время для корректного расчета офлайн прогресса
                lastSaved: new Date().toISOString()
            }
        }

        // Состояние пользователя
        return {
            // Основная валюта
            balance: 0,
            passiveIncome: 0,
            tutorialCompleted: false,

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

                // Загружаем данные из базы
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


        async saveState() {
            if (this.currentUser) {
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

                try {
                    // Сохраняем в localStorage
                    StorageService.saveState({
                        ...gameData,
                        userId: this.currentUser,
                        lastSaved: new Date().toISOString()
                    })

                    // Сохраняем в базу данных
                    await ApiService.updateUser(this.currentUser, {
                        gameData: gameData,
                        lastUpdate: new Date()
                    })

                } catch (error) {
                    console.error('Error saving game state:', error)
                }
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
            this.balance = 0
            this.passiveIncome = 0
            this.energy = {
                current: 1000,
                max: 1000,
                regenRate: 1,
                lastRegenTime: Date.now()
            }
            this.level = {
                current: 1,
                max: 10,
                progress: 0,
                title: 'Пацан'
            }
            this.multipliers = {
                tapValue: 1,
                tapMultiplier: 1,
                incomeBoost: 1
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

        processPassiveIncome() {
            if (this.passiveIncome > 0) {
                const monthInSeconds = 30 * 24 * 60 * 60
                const incomePerSecond = this.passiveIncome / monthInSeconds
                this.balance += (incomePerSecond / 10)
                this.updateLevel()
                this.saveState()
            }
        },

        startPassiveIncomeTimer() {
            setInterval(() => {
                this.processPassiveIncome()
            }, 100)
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

        // Исправленный метод updateLevel()
        updateLevel() {
            // Для отладки
            console.log('Обновление уровня! Текущий пассивный доход:', this.passiveIncome);
            console.log('Пороги уровней:', this.level.levels.map(l => `${l.title}: ${l.income}`).join(', '));

            let newLevel = 1;
            for (let i = 0; i < this.level.levels.length; i++) {
                if (this.passiveIncome >= this.level.levels[i].income) {
                    newLevel = i + 1;
                    console.log(`Порог пройден для уровня ${newLevel} (${this.level.levels[i].title}): ${this.passiveIncome} >= ${this.level.levels[i].income}`);
                } else {
                    // Выходим из цикла, как только найден первый непройденный порог
                    break;
                }
            }

            if (newLevel !== this.level.current) {
                console.log(`Уровень повышен: ${this.level.current} -> ${newLevel} (${this.level.levels[newLevel-1].title})`);
                this.level.current = newLevel;
                this.level.title = this.level.levels[newLevel - 1].title;
            }

            // Расчет прогресса...
            if (newLevel < this.level.levels.length) {
                const currentMin = this.level.levels[newLevel - 1].income;
                const nextMin = this.level.levels[newLevel].income;
                const progress = ((this.passiveIncome - currentMin) / (nextMin - currentMin)) * 100;
                this.level.progress = Math.min(Math.max(progress, 0), 100);
                console.log(`Прогресс до следующего уровня: ${this.level.progress.toFixed(2)}%`);
            } else {
                this.level.progress = 100;
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