// src/services/apiService.js
const API_URL = '/api' // Без упоминания домена

// Единый метод для выполнения API-запроса с обработкой ошибок
async function request(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    // Добавление данных в запрос
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        // Проверка соединения
        if (!navigator.onLine) {
            throw new Error('No internet connection');
        }

        const response = await fetch(url, options);

        // Обработка HTTP-ошибок
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Проверка успешности ответа от API
        if (result.success === false) {
            throw new Error(result.error || 'API returned failure');
        }

        return result;
    } catch (error) {
        console.error(`API Error (${method} ${url}):`, error);
        throw error;
    }
}

export const ApiService = {
    // Пользователи
    async createUser(userData) {
        try {
            return await request(`${API_URL}/users`, 'POST', userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async getUser(telegramId) {
        try {
            return await request(`${API_URL}/users/${telegramId}`);
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    },

    // ИСПРАВЛЕННЫЙ метод getAllUsers
    async getAllUsers() {
        try {
            const response = await request(`${API_URL}/users`);

            // Успешное получение данных с сервера
            if (response && response.success && response.data) {
                return response.data;
            } else if (response && Array.isArray(response)) {
                // Если API возвращает массив напрямую
                return {
                    users: response,
                    stats: {
                        total: response.length,
                        activeToday: 0,
                        newThisWeek: 0,
                        totalIncome: 0
                    }
                };
            }

            throw new Error('Invalid response format from server');
        } catch (error) {
            console.warn('Using mock data due to API error:', error);

            // Мок-данные, используемые при ошибке запроса
            return {
                users: [
                    {
                        id: '123456789',
                        name: 'Иван Петров',
                        level: 5,
                        passiveIncome: 50000,
                        balance: 120000,
                        lastLogin: new Date().toISOString(),
                        registeredAt: '2023-01-01T10:00:00Z',
                        blocked: false
                    },
                    {
                        id: '987654321',
                        name: 'Мария Сидорова',
                        level: 7,
                        passiveIncome: 75000,
                        balance: 200000,
                        lastLogin: new Date().toISOString(),
                        registeredAt: '2023-02-15T14:30:00Z',
                        blocked: false
                    }
                ],
                stats: {
                    total: 2,
                    activeToday: 2,
                    newThisWeek: 0,
                    totalIncome: 125000
                }
            };
        }
    },

    async updateUser(telegramId, userData) {
        try {
            const response = await request(`${API_URL}/admin/users/${telegramId}`, 'PUT', userData);
            console.log('User update response:', response); // Добавим лог
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async blockUser(userId) {
        try {
            return await request(`${API_URL}/users/actions`, 'POST', {
                action: 'block',
                userId
            });
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    },

    async resetUserProgress(userId) {
        try {
            return await request(`${API_URL}/users/actions`, 'POST', {
                action: 'reset',
                userId
            });
        } catch (error) {
            console.error('Error resetting user progress:', error);
            throw error;
        }
    },







    // Задания
    async getTasks() {
        try {
            return await request(`${API_URL}/admin/tasks`);
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    },

    async createTask(taskData) {
        try {
            return await request(`${API_URL}/admin/tasks`, 'POST', taskData);
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    async updateTask(taskId, taskData) {
        try {
            return await request(`${API_URL}/admin/tasks/${taskId}`, 'PUT', taskData);
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    async deleteTask(taskId) {
        try {
            return await request(`${API_URL}/admin/tasks/${taskId}`, 'DELETE');
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Продукты
    // Добавьте следующие методы в apiService.js в объект ApiService

// Получение списка продуктов
    async getProducts() {
        try {
            return await request(`${API_URL}/admin/products`);
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    },

// Создание нового продукта
    async createProduct(productData) {
        try {
            return await request(`${API_URL}/admin/products`, 'POST', productData);
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

// Обновление продукта
    async updateProduct(productId, productData) {
        try {
            return await request(`${API_URL}/admin/products/${productId}`, 'PUT', productData);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

// Удаление продукта
    async deleteProduct(productId) {
        try {
            return await request(`${API_URL}/admin/products/${productId}`, 'DELETE');
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

// Изменение порядка продуктов
    async reorderProducts(orderedIds) {
        try {
            return await request(`${API_URL}/admin/products/reorder`, 'POST', { orderedIds });
        } catch (error) {
            console.error('Error reordering products:', error);
            throw error;
        }
    },

// Получение заявок на продукт
    // Работа с заявками на продукты
    async getProductClaims(productId) {
        try {
            return await request(`${API_URL}/admin/products/${productId}/claims`);
        } catch (error) {
            console.error('Error getting product claims:', error);
            throw error;
        }
    },

    async getRecentClaims() {
        try {
            return await request(`${API_URL}/admin/products/claims/recent`);
        } catch (error) {
            console.error('Error getting recent claims:', error);
            throw error;
        }
    },

    async updateClaimStatus(claimId, status, additionalData = {}) {
        try {
            return await request(`${API_URL}/admin/products/claims/${claimId}`, 'PUT', {
                status,
                ...additionalData
            });
        } catch (error) {
            console.error('Error updating claim status:', error);
            throw error;
        }
    },

// Методы для пользовательской части

// Получение доступных продуктов для пользователя
    async getUserProducts(telegramId) {
        try {
            return await request(`${API_URL}/products?telegramId=${telegramId}`);
        } catch (error) {
            console.error('Error getting user products:', error);
            throw error;
        }
    },

// Создание заявки на продукт
    async createProductClaim(productId, telegramId, userData = {}, claimData = {}) {
        try {
            return await request(`${API_URL}/products/${productId}/claim`, 'POST', {
                telegramId,
                userData,
                claimData
            });
        } catch (error) {
            console.error('Error creating product claim:', error);
            throw error;
        }
    },

    // Настройки игры
    async getGameSettings() {
        try {
            return await request(`${API_URL}/settings`);
        } catch (error) {
            console.error('Error getting game settings:', error);
            throw error;
        }
    },

    async updateGameSettings(settings) {
        try {
            return await request(`${API_URL}/settings`, 'PUT', settings);
        } catch (error) {
            console.error('Error updating game settings:', error);
            throw error;
        }
    },

    // Статистика
    async getStats() {
        try {
            return await request(`${API_URL}/stats`);
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    },

    // Добавляем методы для работы с уведомлениями в ApiService
    async getNotificationsHistory() {
        try {
            return await request(`${API_URL}/admin/notifications`);
        } catch (error) {
            console.error('Error getting notifications history:', error);
            throw error;
        }
    },

    async getNotificationStats() {
        try {
            return await request(`${API_URL}/admin/notifications/stats`);
        } catch (error) {
            console.error('Error getting notification stats:', error);
            throw error;
        }
    },

    async sendNotification(notificationData) {
        try {
            return await request(`${API_URL}/notifications/send`, 'POST', notificationData);
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    },

    // Тестовая отправка уведомления
    async sendTestNotification(notificationData) {
        try {
            return await request(`${API_URL}/notifications/test`, 'POST', notificationData);
        } catch (error) {
            console.error('Error sending test notification:', error);
            throw error;
        }
    },

    async updateNotification(notificationId, notificationData) {
        try {
            return await request(`${API_URL}/admin/notifications/${notificationId}`, 'PUT', notificationData);
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    },

    async deleteNotification(notificationId) {
        try {
            return await request(`${API_URL}/admin/notifications/${notificationId}`, 'DELETE');
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },


    // Расширенная работа с пользователями
    async getUserStats() {
        try {
            return await request(`${API_URL}/admin/users/stats`);
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    },

    async searchUsers(query) {
        try {
            return await request(`${API_URL}/admin/users/search?q=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    },

    // Улучшенная работа с настройками
    async getDefaultSettings() {
        try {
            return await request(`${API_URL}/settings/default`);
        } catch (error) {
            console.error('Error getting default settings:', error);
            return {
                tapValue: 1,
                baseEnergy: 100,
                energyRegenRate: 1,
                incomeMultiplier: 1,
                expMultiplier: 1,
                boosts: {
                    tap3xCost: 8000,
                    tap5xCost: 25000,
                    duration: 86400000 // 24 часа в миллисекундах
                },
                investments: {
                    baseReturn: 1.5,
                    levelMultiplier: 1.2
                },
                levelRequirements: [
                    { level: 1, income: 0, title: 'Новичок' }
                ]
            };
        }
    },

    async resetSettings() {
        try {
            return await request(`${API_URL}/settings/reset`, 'POST');
        } catch (error) {
            console.error('Error resetting settings:', error);
            throw error;
        }
    },

    // В метод отправки уведомлений нужно добавить поддержку планирования
    async scheduleNotification(notificationData) {
        try {
            return await request(`${API_URL}/notifications/schedule`, 'POST', notificationData);
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw error;
        }
    }
};