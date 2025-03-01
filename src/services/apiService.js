// src/services/apiService.js
const API_URL = '/api'; // В продакшне это будет относительный путь

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
            throw new Error('Нет интернет-соединения');
        }

        console.log(`Выполняется запрос: ${method} ${url}`);
        const response = await fetch(url, options);
        console.log(`Получен ответ со статусом: ${response.status}`);

        // Получаем текст ответа для логирования
        const responseText = await response.text();
        console.log('Содержимое ответа:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));

        // Парсим JSON ответ
        const result = responseText ? JSON.parse(responseText) : {};

        // Проверка успешности ответа от API
        if (result.success === false) {
            throw new Error(result.error || 'API вернул ошибку');
        }

        return result;
    } catch (error) {
        console.error(`API Error (${method} ${url}):`, error);
        throw error;
    }
}

export const ApiService = {
    // ПОЛЬЗОВАТЕЛИ
    // ============

    // Получение всех пользователей с пагинацией и фильтрацией
    async getAllUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 50,
                search: params.search || '',
                sortBy: params.sortBy || 'lastLogin',
                sortOrder: params.sortOrder || 'desc'
            }).toString();

            console.log(`Запрос пользователей с параметрами: ${queryParams}`);
            return await request(`${API_URL}/admin/users?${queryParams}`);
        } catch (error) {
            console.error('Ошибка получения пользователей:', error);
            throw error;
        }
    },

    // Получение конкретного пользователя
    async getUser(telegramId) {
        try {
            console.log(`Запрос пользователя с ID: ${telegramId}`);
            return await request(`${API_URL}/admin/users/${telegramId}`);
        } catch (error) {
            console.error(`Ошибка получения пользователя ${telegramId}:`, error);
            throw error;
        }
    },

    // Обновление пользователя
    async updateUser(telegramId, userData) {
        try {
            console.log(`Обновление пользователя с ID: ${telegramId}`);
            return await request(`${API_URL}/admin/users/${telegramId}`, 'PUT', userData);
        } catch (error) {
            console.error(`Ошибка обновления пользователя ${telegramId}:`, error);
            throw error;
        }
    },

    // Блокировка/разблокировка пользователя
    async toggleUserBlock(userId) {
        try {
            console.log(`Блокировка/разблокировка пользователя с ID: ${userId}`);
            return await request(`${API_URL}/admin/users/actions`, 'POST', {
                action: 'block',
                userId
            });
        } catch (error) {
            console.error(`Ошибка блокировки/разблокировки пользователя ${userId}:`, error);
            throw error;
        }
    },

    // Сброс прогресса пользователя
    async resetUserProgress(userId) {
        try {
            console.log(`Сброс прогресса пользователя с ID: ${userId}`);
            return await request(`${API_URL}/admin/users/actions`, 'POST', {
                action: 'reset',
                userId
            });
        } catch (error) {
            console.error(`Ошибка сброса прогресса пользователя ${userId}:`, error);
            throw error;
        }
    },

    // ПРОДУКТЫ
    // ========

    // Получение всех продуктов
    async getProducts() {
        try {
            console.log('Запрос списка продуктов');
            return await request(`${API_URL}/admin/products`);
        } catch (error) {
            console.error('Ошибка получения продуктов:', error);
            throw error;
        }
    },

    // Создание нового продукта
    async createProduct(productData) {
        try {
            console.log('Создание нового продукта');
            return await request(`${API_URL}/admin/products`, 'POST', productData);
        } catch (error) {
            console.error('Ошибка создания продукта:', error);
            throw error;
        }
    },

    // Обновление продукта
    async updateProduct(productId, productData) {
        try {
            console.log(`Обновление продукта с ID: ${productId}`);
            return await request(`${API_URL}/admin/products/${productId}`, 'PUT', productData);
        } catch (error) {
            console.error(`Ошибка обновления продукта ${productId}:`, error);
            throw error;
        }
    },

    // Удаление продукта
    async deleteProduct(productId) {
        try {
            console.log(`Удаление продукта с ID: ${productId}`);
            return await request(`${API_URL}/admin/products/${productId}`, 'DELETE');
        } catch (error) {
            console.error(`Ошибка удаления продукта ${productId}:`, error);
            throw error;
        }
    },

    // Изменение порядка продуктов
    async reorderProducts(orderedIds) {
        try {
            console.log('Изменение порядка продуктов');
            return await request(`${API_URL}/admin/products/reorder`, 'POST', { orderedIds });
        } catch (error) {
            console.error('Ошибка изменения порядка продуктов:', error);
            throw error;
        }
    },

    // Получение заявок на продукт
    async getProductClaims(productId) {
        try {
            console.log(`Запрос заявок на продукт с ID: ${productId}`);
            return await request(`${API_URL}/admin/products/${productId}/claims`);
        } catch (error) {
            console.error(`Ошибка получения заявок на продукт ${productId}:`, error);
            throw error;
        }
    },

    // Получение последних заявок
    async getRecentClaims() {
        try {
            console.log('Запрос последних заявок');
            return await request(`${API_URL}/admin/products/claims/recent`);
        } catch (error) {
            console.error('Ошибка получения последних заявок:', error);
            throw error;
        }
    },

    // Обновление статуса заявки
    async updateClaimStatus(claimId, status, additionalData = {}) {
        try {
            console.log(`Обновление статуса заявки с ID: ${claimId} на ${status}`);
            return await request(`${API_URL}/admin/products/claims/${claimId}`, 'PUT', {
                status,
                ...additionalData
            });
        } catch (error) {
            console.error(`Ошибка обновления статуса заявки ${claimId}:`, error);
            throw error;
        }
    },

    // УВЕДОМЛЕНИЯ
    // ===========

    // Получение истории уведомлений
    async getNotificationsHistory() {
        try {
            console.log('Запрос истории уведомлений');
            return await request(`${API_URL}/admin/notifications`);
        } catch (error) {
            console.error('Ошибка получения истории уведомлений:', error);
            throw error;
        }
    },

    // Получение статистики по уведомлениям
    async getNotificationStats() {
        try {
            console.log('Запрос статистики по уведомлениям');
            return await request(`${API_URL}/admin/notifications/stats`);
        } catch (error) {
            console.error('Ошибка получения статистики по уведомлениям:', error);
            throw error;
        }
    },

    // Отправка уведомления
    async sendNotification(notificationData) {
        try {
            console.log('Отправка уведомления:', notificationData);
            return await request(`${API_URL}/notifications/send`, 'POST', notificationData);
        } catch (error) {
            console.error('Ошибка отправки уведомления:', error);
            throw error;
        }
    },

    // Тестовая отправка уведомления
    async sendTestNotification(notificationData) {
        try {
            console.log('Отправка тестового уведомления:', notificationData);
            return await request(`${API_URL}/notifications/test`, 'POST', notificationData);
        } catch (error) {
            console.error('Ошибка отправки тестового уведомления:', error);
            throw error;
        }
    },

    // Обновление уведомления
    async updateNotification(notificationId, notificationData) {
        try {
            console.log(`Обновление уведомления с ID: ${notificationId}`);
            return await request(`${API_URL}/admin/notifications/${notificationId}`, 'PUT', notificationData);
        } catch (error) {
            console.error(`Ошибка обновления уведомления ${notificationId}:`, error);
            throw error;
        }
    },

    // Удаление уведомления
    async deleteNotification(notificationId) {
        try {
            console.log(`Удаление уведомления с ID: ${notificationId}`);
            return await request(`${API_URL}/admin/notifications/${notificationId}`, 'DELETE');
        } catch (error) {
            console.error(`Ошибка удаления уведомления ${notificationId}:`, error);
            throw error;
        }
    },

    // Планирование уведомления
    async scheduleNotification(notificationData) {
        try {
            console.log('Планирование уведомления:', notificationData);
            return await request(`${API_URL}/notifications/schedule`, 'POST', notificationData);
        } catch (error) {
            console.error('Ошибка планирования уведомления:', error);
            throw error;
        }
    },

    // ЗАДАНИЯ
    // =======

    // Получение всех заданий
    async getTasks() {
        try {
            console.log('Запрос списка заданий');
            return await request(`${API_URL}/admin/tasks`);
        } catch (error) {
            console.error('Ошибка получения заданий:', error);
            throw error;
        }
    },

    // Создание нового задания
    async createTask(taskData) {
        try {
            console.log('Создание нового задания');
            return await request(`${API_URL}/admin/tasks`, 'POST', taskData);
        } catch (error) {
            console.error('Ошибка создания задания:', error);
            throw error;
        }
    },

    // Обновление задания
    async updateTask(taskId, taskData) {
        try {
            console.log(`Обновление задания с ID: ${taskId}`);
            return await request(`${API_URL}/admin/tasks/${taskId}`, 'PUT', taskData);
        } catch (error) {
            console.error(`Ошибка обновления задания ${taskId}:`, error);
            throw error;
        }
    },

    // Удаление задания
    async deleteTask(taskId) {
        try {
            console.log(`Удаление задания с ID: ${taskId}`);
            return await request(`${API_URL}/admin/tasks/${taskId}`, 'DELETE');
        } catch (error) {
            console.error(`Ошибка удаления задания ${taskId}:`, error);
            throw error;
        }
    },

    // НАСТРОЙКИ
    // =========

    // Получение настроек игры
    async getGameSettings() {
        try {
            console.log('Запрос настроек игры');
            return await request(`${API_URL}/settings`);
        } catch (error) {
            console.error('Ошибка получения настроек игры:', error);
            throw error;
        }
    },

    // Обновление настроек игры
    async updateGameSettings(settings) {
        try {
            console.log('Обновление настроек игры');
            return await request(`${API_URL}/settings`, 'PUT', settings);
        } catch (error) {
            console.error('Ошибка обновления настроек игры:', error);
            throw error;
        }
    },

    // СТАТИСТИКА
    // ==========

    // Получение общей статистики
    async getStats() {
        try {
            console.log('Запрос общей статистики');
            return await request(`${API_URL}/stats`);
        } catch (error) {
            console.error('Ошибка получения общей статистики:', error);
            throw error;
        }
    },

    // ПОЛЬЗОВАТЕЛЬСКАЯ ЧАСТЬ API
    // ==========================

    // Получение продуктов для пользователя
    async getUserProducts(telegramId) {
        try {
            console.log(`Запрос продуктов для пользователя ${telegramId}`);
            return await request(`${API_URL}/users/${telegramId}/products`);
        } catch (error) {
            console.error(`Ошибка получения продуктов для пользователя ${telegramId}:`, error);
            throw error;
        }
    },

    // Создание заявки на продукт от пользователя
    async createProductClaim(telegramId, productId, claimData = {}) {
        try {
            console.log(`Создание заявки на продукт ${productId} от пользователя ${telegramId}`);
            return await request(`${API_URL}/users/${telegramId}/products/${productId}/claim`, 'POST', claimData);
        } catch (error) {
            console.error(`Ошибка создания заявки на продукт:`, error);
            throw error;
        }
    },

    // Получение рефералов пользователя
    async getUserReferrals(telegramId) {
        try {
            console.log(`Запрос рефералов пользователя ${telegramId}`);
            return await request(`${API_URL}/users/${telegramId}/referrals`);
        } catch (error) {
            console.error(`Ошибка получения рефералов пользователя ${telegramId}:`, error);
            throw error;
        }
    }
};