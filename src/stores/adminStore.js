// src/stores/adminStore.js
import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        users: [],
        tasks: [],
        products: [],
        notifications: [],
        gameSettings: {
            tapValue: 1,
            baseEnergy: 100,
            incomeMultiplier: 1,
            expMultiplier: 1
        },
        stats: {
            totalUsers: 0,
            activeUsers: 0,
            newUsers: 0,
            totalRevenue: 0
        }
    }),

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
            // Здесь будет API запрос
            this.users = [
                // Тестовые данные
                {
                    id: 1,
                    name: 'User 1',
                    level: 5,
                    passiveIncome: 1000,
                    balance: 5000,
                    lastLogin: new Date()
                }
                // ...
            ]
        },

        async blockUser(userId) {
            // API запрос на блокировку
        },

        async resetUserProgress(userId) {
            // API запрос на сброс прогресса
        },

        // Управление заданиями
        async createTask(taskData) {
            // API запрос на создание задания
        },

        async updateTask(taskId, taskData) {
            // API запрос на обновление задания
        },

        async deleteTask(taskId) {
            // API запрос на удаление задания
        },

        // Управление игровыми настройками
        async updateGameSettings(settings) {
            // API запрос на обновление настроек
            this.gameSettings = settings
        },

        // Управление уведомлениями
        async sendNotification(notification) {
            // API запрос на отправку уведомления
        }
    }
})