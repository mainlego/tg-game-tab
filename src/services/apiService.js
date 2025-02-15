// src/services/apiService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const ApiService = {
    // Пользователи
    async createUser(userData) {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    async getUser(telegramId) {
        try {
            const response = await fetch(`${API_URL}/users/${telegramId}`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting user:', error)
            throw error
        }
    },

    async updateUser(telegramId, userData) {
        try {
            const response = await fetch(`${API_URL}/users/${telegramId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    },

    async getAllUsers() {
        try {
            const response = await fetch(`${API_URL}/users`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting all users:', error)
            throw error
        }
    },

    async updateGameData(telegramId, gameData) {
        try {
            const response = await fetch(`${API_URL}/users/${telegramId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gameData })
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error updating game data:', error)
            throw error
        }
    },

    async blockUser(telegramId, blocked) {
        try {
            const response = await fetch(`${API_URL}/users/${telegramId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ blocked })
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error blocking user:', error)
            throw error
        }
    }
};