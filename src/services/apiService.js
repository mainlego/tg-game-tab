// src/services/apiService.js
const API_URL = import.meta.env.VITE_API_URL || 'https://tg-game-tab-server.onrender.com/api'

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

    async getAllUsers() {
        try {
            const response = await fetch(`${API_URL}/admin/users`);
            if (!response.ok) {
                throw new Error('Ошибка получения пользователей');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
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

    async blockUser(userId) {
        try {
            const response = await fetch(`${API_URL}/admin/users/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'block',
                    userId
                })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    },

    async resetUserProgress(userId) {
        try {
            const response = await fetch(`${API_URL}/admin/users/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'reset',
                    userId
                })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        } catch (error) {
            console.error('Error resetting user progress:', error);
            throw error;
        }
    },

    // Задания
    async getTasks() {
        try {
            const response = await fetch(`${API_URL}/admin/tasks`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting tasks:', error)
            throw error
        }
    },

    async createTask(taskData) {
        try {
            const response = await fetch(`${API_URL}/admin/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error creating task:', error)
            throw error
        }
    },

    async updateTask(taskId, taskData) {
        try {
            const response = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error updating task:', error)
            throw error
        }
    },

    async deleteTask(taskId) {
        try {
            const response = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error deleting task:', error)
            throw error
        }
    },

    // Продукты
    async getProducts() {
        try {
            const response = await fetch(`${API_URL}/admin/products`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting products:', error)
            throw error
        }
    },

    async createProduct(productData) {
        try {
            const response = await fetch(`${API_URL}/admin/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error creating product:', error)
            throw error
        }
    },

    async updateProduct(productId, productData) {
        try {
            const response = await fetch(`${API_URL}/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error updating product:', error)
            throw error
        }
    },

    async deleteProduct(productId) {
        try {
            const response = await fetch(`${API_URL}/admin/products/${productId}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error deleting product:', error)
            throw error
        }
    },

    async reorderProducts(orderedIds) {
        try {
            const response = await fetch(`${API_URL}/admin/products/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderedIds })
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error reordering products:', error)
            throw error
        }
    },

    // Настройки игры
    async getGameSettings() {
        try {
            const response = await fetch(`${API_URL}/settings`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting game settings:', error)
            throw error
        }
    },

    async updateGameSettings(settings) {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error updating game settings:', error)
            throw error
        }
    },

    // Статистика
    async getStats() {
        try {
            const response = await fetch(`${API_URL}/stats`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting stats:', error)
            throw error
        }
    },

    // Добавляем методы для работы с уведомлениями в ApiService
    async getNotificationsHistory() {
        try {
            const response = await fetch(`${API_URL}/admin/notifications`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting notifications history:', error)
            throw error
        }
    },

    async getNotificationStats() {
        try {
            const response = await fetch(`${API_URL}/admin/notifications/stats`)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error getting notification stats:', error)
            throw error
        }
    },

    async sendNotification(notificationData) {
        try {
            const response = await fetch(`${API_URL}/notifications/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    },

    // Тестовая отправка уведомления
    async sendTestNotification(notificationData) {
        try {
            const response = await fetch(`${API_URL}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to send test notification')
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error sending test notification:', error)
            throw error
        }
    },


    async updateNotification(notificationId, notificationData) {
        try {
            const response = await fetch(`${API_URL}/admin/notifications/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error updating notification:', error)
            throw error
        }
    },

    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`${API_URL}/admin/notifications/${notificationId}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            return data.data
        } catch (error) {
            console.error('Error deleting notification:', error)
            throw error
        }
    }






};