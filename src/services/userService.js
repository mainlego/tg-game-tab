// src/services/userService.js
const USERS_KEY = 'game_users'

export const UserService = {
    // Создание или обновление пользователя
    saveUser(userData) {
        try {
            const users = this.getAllUsers()
            users[userData.id] = {
                ...userData,
                registeredAt: userData.registeredAt || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                gameData: userData.gameData || {
                    level: 1,
                    balance: 0,
                    passiveIncome: 0,
                    energy: {
                        current: 1000,
                        max: 1000
                    }
                }
            }
            localStorage.setItem(USERS_KEY, JSON.stringify(users))
            return users[userData.id]
        } catch (error) {
            console.error('Error saving user:', error)
            return null
        }
    },

    // Получение пользователя по ID
    getUser(userId) {
        try {
            const users = this.getAllUsers()
            return users[userId] || null
        } catch (error) {
            console.error('Error getting user:', error)
            return null
        }
    },

    // Получение всех пользователей
    getAllUsers() {
        try {
            const users = localStorage.getItem(USERS_KEY)
            return users ? JSON.parse(users) : {}
        } catch (error) {
            console.error('Error getting all users:', error)
            return {}
        }
    },

    // Обновление игровых данных пользователя
    updateGameData(userId, gameData) {
        try {
            const user = this.getUser(userId)
            if (user) {
                user.gameData = {
                    ...user.gameData,
                    ...gameData
                }
                user.lastLogin = new Date().toISOString()
                return this.saveUser(user)
            }
            return null
        } catch (error) {
            console.error('Error updating game data:', error)
            return null
        }
    },

    // Получение статистики пользователей
    getUsersStats() {
        try {
            const users = this.getAllUsers()
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)

            return {
                total: Object.keys(users).length,
                activeToday: Object.values(users).filter(user => {
                    const lastLogin = new Date(user.lastLogin)
                    return lastLogin >= today
                }).length,
                newThisWeek: Object.values(users).filter(user => {
                    const registeredAt = new Date(user.registeredAt)
                    return registeredAt >= weekAgo
                }).length
            }
        } catch (error) {
            console.error('Error getting users stats:', error)
            return {
                total: 0,
                activeToday: 0,
                newThisWeek: 0
            }
        }
    },

    // Блокировка/разблокировка пользователя
    toggleUserBlock(userId) {
        try {
            const user = this.getUser(userId)
            if (user) {
                user.blocked = !user.blocked
                return this.saveUser(user)
            }
            return null
        } catch (error) {
            console.error('Error toggling user block:', error)
            return null
        }
    },

    // Сброс прогресса пользователя
    resetUserProgress(userId) {
        try {
            const user = this.getUser(userId)
            if (user) {
                user.gameData = {
                    level: 1,
                    balance: 0,
                    passiveIncome: 0,
                    energy: {
                        current: 1000,
                        max: 1000
                    }
                }
                return this.saveUser(user)
            }
            return null
        } catch (error) {
            console.error('Error resetting user progress:', error)
            return null
        }
    }
}