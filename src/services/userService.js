// src/services/userService.js
import { ApiService } from './apiService'

export const UserService = {
    async saveUser(userData) {
        try {
            const existingUser = await this.getUser(userData.telegramId)
            if (existingUser) {
                return await ApiService.updateUser(userData.telegramId, {
                    ...userData,
                    lastLogin: new Date()
                })
            } else {
                return await ApiService.createUser({
                    ...userData,
                    registeredAt: new Date(),
                    lastLogin: new Date()
                })
            }
        } catch (error) {
            console.error('Error saving user:', error)
            return null
        }
    },

    async getUser(telegramId) {
        try {
            return await ApiService.getUser(telegramId)
        } catch (error) {
            console.error('Error getting user:', error)
            return null
        }
    },

    async getAllUsers() {
        try {
            return await ApiService.getAllUsers()
        } catch (error) {
            console.error('Error getting all users:', error)
            return []
        }
    },

    async updateGameData(telegramId, gameData) {
        try {
            return await ApiService.updateGameData(telegramId, gameData)
        } catch (error) {
            console.error('Error updating game data:', error)
            return null
        }
    },

    async getUsersStats() {
        try {
            const users = await this.getAllUsers()
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)

            return {
                total: users.length,
                activeToday: users.filter(user => new Date(user.lastLogin) >= today).length,
                newThisWeek: users.filter(user => new Date(user.registeredAt) >= weekAgo).length
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

    async blockUser(telegramId) {
        try {
            const user = await this.getUser(telegramId)
            if (user) {
                return await ApiService.blockUser(telegramId, !user.blocked)
            }
            return null
        } catch (error) {
            console.error('Error blocking user:', error)
            return null
        }
    },

    async resetUserProgress(telegramId) {
        try {
            return await ApiService.updateGameData(telegramId, {
                balance: 0,
                passiveIncome: 0,
                energy: {
                    current: 1000,
                    max: 1000,
                    regenRate: 1,
                    lastRegenTime: Date.now()
                },
                level: {
                    current: 1,
                    max: 10,
                    progress: 0,
                    title: 'Пацан'
                },
                multipliers: {
                    tapValue: 1,
                    tapMultiplier: 1,
                    incomeBoost: 1
                },
                boosts: {
                    tap3x: { active: false, endTime: null },
                    tap5x: { active: false, endTime: null }
                },
                investments: {
                    purchased: [],
                    activeIncome: 0,
                    lastCalculation: Date.now()
                },
                stats: {
                    totalClicks: 0,
                    totalEarned: 0,
                    maxPassiveIncome: 0
                }
            })
        } catch (error) {
            console.error('Error resetting user progress:', error)
            return null
        }
    }
};