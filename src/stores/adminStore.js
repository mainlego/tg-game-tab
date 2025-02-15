// src/stores/adminStore.js
import { defineStore } from 'pinia'
import { StorageService } from '@/services/storage'
import { ReferralService } from '@/services/referralService'

export const useAdminStore = defineStore('admin', {
    state: () => {
        const savedSettings = StorageService.loadState()?.gameSettings || {}
        return {
            users: [],
            tasks: [],
            products: [],
            notifications: [],
            gameSettings: {
                tapValue: savedSettings.tapValue || 1,
                baseEnergy: savedSettings.baseEnergy || 100,
                incomeMultiplier: savedSettings.incomeMultiplier || 1,
                expMultiplier: savedSettings.expMultiplier || 1
            },
            stats: {
                totalUsers: 0,
                activeUsers: 0,
                newUsers: 0,
                totalRevenue: 0
            }
        }
    },

    getters: {
        userStats: (state) => {
            return {
                total: state.users.length,
                activeToday: state.users.filter(user => {
                    const lastLogin = new Date(user.lastLogin)
                    const today = new Date()
                    return lastLogin.toDateString() === today.toDateString()
                }).length,
                newThisWeek: state.users.filter(user => {
                    const joinDate = new Date(user.joinDate)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return joinDate > weekAgo
                }).length
            }
        }
    },

    actions: {
        // Аутентификация
        async login(username, password) {
            // В реальном приложении здесь будет API запрос
            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('isAdmin', 'true')
                return true
            }
            return false
        },

        // Управление пользователями
        async fetchUsers() {
            const allUsers = UserService.getAllUsers()
            this.users = Object.values(allUsers).map(user => ({
                id: user.id,
                name: `${user.first_name} ${user.last_name || ''}`.trim(),
                level: user.gameData.level,
                passiveIncome: user.gameData.passiveIncome,
                balance: user.gameData.balance,
                lastLogin: user.lastLogin,
                joinDate: user.registeredAt,
                blocked: user.blocked || false
            }))

            // Обновляем статистику
            const stats = UserService.getUsersStats()
            this.stats = {
                ...this.stats,
                totalUsers: stats.total,
                activeUsers: stats.activeToday,
                newUsers: stats.newThisWeek
            }
        },

        async blockUser(userId) {
            const updatedUser = UserService.toggleUserBlock(userId)
            if (updatedUser) {
                await this.fetchUsers()
                return true
            }
            return false
        },

        async resetUserProgress(userId) {
            const updatedUser = UserService.resetUserProgress(userId)
            if (updatedUser) {
                await this.fetchUsers()
                return true
            }
            return false
        },

        // Управление заданиями
        async fetchTasks() {
            // Здесь будет API запрос
            this.tasks = [
                {
                    id: 1,
                    title: 'Ежедневное задание',
                    description: 'Описание задания',
                    reward: 100,
                    active: true,
                    completions: 0
                }
            ]
        },

        async createTask(taskData) {
            // Здесь будет API запрос
            this.tasks.push({
                id: Date.now(),
                ...taskData,
                completions: 0
            })
        },

        async updateTask(taskId, taskData) {
            const index = this.tasks.findIndex(t => t.id === taskId)
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...taskData }
                // Здесь будет API запрос
            }
        },

        async toggleTaskStatus(taskId) {
            const task = this.tasks.find(t => t.id === taskId)
            if (task) {
                task.active = !task.active
                // Здесь будет API запрос
            }
        },

        // Управление продуктами
        async fetchProducts() {
            // Здесь будет API запрос
            this.products = [
                {
                    id: 1,
                    name: 'Product 1',
                    description: 'Product description',
                    requiredIncome: 1000000,
                    image: '/images/products/1.png',
                    active: true
                }
            ]
        },

        async createProduct(productData) {
            // Здесь будет API запрос
            this.products.push({
                id: Date.now(),
                ...productData
            })
        },

        async updateProduct(productId, productData) {
            const index = this.products.findIndex(p => p.id === productId)
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...productData }
                // Здесь будет API запрос
            }
        },

        async toggleProduct(productId) {
            const product = this.products.find(p => p.id === productId)
            if (product) {
                product.active = !product.active
                // Здесь будет API запрос
            }
        },

        // Управление игровыми настройками
        async updateGameSettings(settings) {
            this.gameSettings = { ...this.gameSettings, ...settings }
            StorageService.saveState({ ...StorageService.loadState(), gameSettings: this.gameSettings })
        },

        // Управление уведомлениями
        async sendNotification(notificationData) {
            // Здесь будет API запрос для отправки уведомления
            this.notifications.push({
                id: Date.now(),
                ...notificationData,
                sentAt: new Date(),
                sentCount: 0,
                readCount: 0
            })
        }
    }
})