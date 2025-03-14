// src/services/apiService.js

// Константы
const API_URL = import.meta.env.VITE_API_URL || '/api'; // Берем URL из переменных окружения или используем относительный путь
const DEBUG = import.meta.env.MODE === 'development'; // Включаем отладку только в режиме разработки

/**
 * Универсальный метод для отправки запросов к API с обработкой ошибок
 * @param {string} url - URL запроса
 * @param {string} method - HTTP метод (GET, POST, PUT, DELETE)
 * @param {Object} data - данные для отправки (для POST, PUT)
 * @param {Object} options - дополнительные опции для fetch
 * @returns {Promise<any>} - данные ответа или выбрасывает ошибку
 */
async function request(url, method = 'GET', data = null, options = {}) {
    // Формируем полный URL
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

    // Настройки запроса
    const fetchOptions = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        },
        credentials: 'include', // Для работы с куками
        ...options
    };

    // Добавляем тело запроса для методов не-GET
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(data);
    }

    // Логирование в режиме разработки
    if (DEBUG) {
        console.group(`📡 API Request: ${method} ${url}`);
        console.log('Options:', fetchOptions);
        if (data) console.log('Data:', data);
        console.groupEnd();
    }

    try {
        // Проверка наличия интернет-соединения
        if (!navigator.onLine) {
            throw new Error('Отсутствует подключение к интернету.');
        }

        // Выполняем запрос
        const response = await fetch(fullUrl, fetchOptions);

        // Получаем текст ответа
        const responseText = await response.text();

        // Преобразуем текст в JSON, если он не пустой
        const result = responseText ? JSON.parse(responseText) : {};

        // Логирование ответа в режиме разработки
        if (DEBUG) {
            console.group(`🔍 API Response: ${method} ${url}`);
            console.log('Status:', response.status);
            console.log('Response:', result);
            console.groupEnd();
        }

        // Проверка на ошибки HTTP и API
        if (!response.ok || (result.success === false)) {
            const errorMessage = result.error || result.message || `HTTP ошибка: ${response.status}`;
            throw new Error(errorMessage);
        }

        // Возвращаем данные (либо из поля data, либо весь результат)
        return result.data || result;

    } catch (error) {
        // Обработка ошибок
        if (DEBUG) {
            console.error(`❌ API Error (${method} ${url}):`, error);
        }

        // Форматируем ошибку для пользователя
        const userFriendlyError = new Error(
            error.message === 'Failed to fetch'
                ? 'Не удалось подключиться к серверу. Проверьте подключение к интернету.'
                : error.message
        );

        // Сохраняем оригинальную ошибку и детали запроса
        userFriendlyError.originalError = error;
        userFriendlyError.request = { url, method, data };

        throw userFriendlyError;
    }
}

/**
 * Сервис для работы с API
 */
export const ApiService = {
    // УТИЛИТЫ
    // =======

    /**
     * Форматирование параметров запроса из объекта
     * @param {Object} params - объект с параметрами
     * @returns {string} - строка параметров для URL
     */
    formatQueryParams(params = {}) {
        return new URLSearchParams(
            Object.entries(params)
                .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                .map(([key, value]) => [key, value.toString()])
        ).toString();
    },

    // СТАТИСТИКА
    // ==========

    /**
     * Получение общей статистики приложения
     * @returns {Promise<Object>} - объект со статистикой
     */
    async getStats() {
        return request('/admin/stats');
    },

    // ПОЛЬЗОВАТЕЛИ
    // ============

    /**
     * Получение списка пользователей с фильтрацией и пагинацией
     * @param {Object} params - параметры запроса
     * @returns {Promise<Object>} - объект со списком пользователей и метаданными
     */
    async getAllUsers(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 50,
            search: '',
            sortBy: 'lastLogin',
            sortOrder: 'desc'
        };

        const queryParams = this.formatQueryParams({
            ...defaultParams,
            ...params
        });

        return request(`/admin/users?${queryParams}`);
    },

    /**
     * Получение данных конкретного пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - данные пользователя
     */
    async getUser(userId) {
        return request(`/admin/users/${userId}`);
    },

    /**
     * Обновление данных пользователя
     * @param {string} userId - ID пользователя
     * @param {Object} userData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async updateUser(userId, userData) {
        return request(`/admin/users/${userId}`, 'PUT', userData);
    },

    /**
     * Блокировка/разблокировка пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async toggleUserBlock(userId) {
        return request(`/admin/users/actions`, 'POST', {
            action: 'block',
            userId
        });
    },

    /**
     * Блокировка пользователя (alias для toggleUserBlock)
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async blockUser(userId) {
        return this.toggleUserBlock(userId);
    },

    /**
     * Сброс прогресса пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async resetUserProgress(userId) {
        return request(`/admin/users/actions`, 'POST', {
            action: 'reset',
            userId
        });
    },

    /**
     * Получение списка рефералов пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Array>} - список рефералов
     */
    async getUserReferrals(userId) {
        return request(`/users/${userId}/referrals`);
    },

    // ПРОДУКТЫ
    // ========

    /**
     * Получение списка всех продуктов
     * @returns {Promise<Array>} - список продуктов
     */
    async getProducts() {
        return request('/admin/products');
    },

    /**
     * Создание нового продукта
     * @param {Object} productData - данные продукта
     * @returns {Promise<Object>} - созданный продукт
     */
    async createProduct(productData) {
        return request('/admin/products', 'POST', productData);
    },

    /**
     * Получение данных конкретного продукта
     * @param {string} productId - ID продукта
     * @returns {Promise<Object>} - данные продукта
     */
    async getProduct(productId) {
        return request(`/admin/products/${productId}`);
    },

    /**
     * Обновление данных продукта
     * @param {string} productId - ID продукта
     * @param {Object} productData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные продукта
     */
    async updateProduct(productId, productData) {
        return request(`/admin/products/${productId}`, 'PUT', productData);
    },

    /**
     * Удаление продукта
     * @param {string} productId - ID продукта
     * @returns {Promise<Object>} - результат операции
     */
    async deleteProduct(productId) {
        return request(`/admin/products/${productId}`, 'DELETE');
    },

    /**
     * Изменение порядка отображения продуктов
     * @param {Array<string>} orderedIds - массив ID продуктов в нужном порядке
     * @returns {Promise<Array>} - обновленный список продуктов
     */
    async reorderProducts(orderedIds) {
        return request('/admin/products/reorder', 'POST', { orderedIds });
    },

    /**
     * Получение заявок на продукт
     * @param {string} productId - ID продукта
     * @returns {Promise<Array>} - список заявок
     */
    async getProductClaims(productId) {
        return request(`/admin/products/${productId}/claims`);
    },

    /**
     * Получение последних заявок на продукты
     * @returns {Promise<Array>} - список последних заявок
     */
    async getRecentClaims() {
        return request('/admin/products/claims/recent');
    },

    /**
     * Обновление статуса заявки
     * @param {string} claimId - ID заявки
     * @param {string} status - новый статус
     * @param {Object} additionalData - дополнительные данные (примечание и др.)
     * @returns {Promise<Object>} - обновленные данные заявки
     */
    async updateClaimStatus(claimId, status, additionalData = {}) {
        return request(`/admin/products/claims/${claimId}`, 'PUT', {
            status,
            ...additionalData
        });
    },

    /**
     * Создание заявки на продукт пользователем
     * @param {string} userId - ID пользователя
     * @param {string} productId - ID продукта
     * @param {Object} claimData - дополнительные данные заявки
     * @returns {Promise<Object>} - созданная заявка
     */
    async createProductClaim(userId, productId, claimData = {}) {
        return request(`/users/${userId}/products/${productId}/claim`, 'POST', claimData);
    },

    // УВЕДОМЛЕНИЯ
    // ===========

    /**
     * Получение истории уведомлений
     * @returns {Promise<Array>} - список уведомлений
     */
    async getNotificationsHistory() {
        return request('/admin/notifications');
    },

    /**
     * Получение статистики по уведомлениям
     * @returns {Promise<Object>} - статистика уведомлений
     */
    async getNotificationStats() {
        return request('/admin/notifications/stats');
    },

    /**
     * Получение конкретного уведомления
     * @param {string} notificationId - ID уведомления
     * @returns {Promise<Object>} - данные уведомления
     */
    async getNotification(notificationId) {
        return request(`/admin/notifications/${notificationId}`);
    },

    /**
     * Отправка уведомления
     * @param {Object} notificationData - данные уведомления
     * @returns {Promise<Object>} - результат отправки
     */
    async sendNotification(notificationData) {
        return request('/notifications/send', 'POST', notificationData);
    },

    /**
     * Тестовая отправка уведомления
     * @param {Object} notificationData - данные уведомления
     * @returns {Promise<Object>} - результат отправки
     */
    async sendTestNotification(notificationData) {
        return request('/notifications/test', 'POST', notificationData);
    },

    /**
     * Планирование отправки уведомления
     * @param {Object} notificationData - данные уведомления
     * @returns {Promise<Object>} - созданное запланированное уведомление
     */
    async scheduleNotification(notificationData) {
        return request('/notifications/schedule', 'POST', notificationData);
    },

    /**
     * Обновление уведомления
     * @param {string} notificationId - ID уведомления
     * @param {Object} notificationData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные уведомления
     */
    async updateNotification(notificationId, notificationData) {
        return request(`/admin/notifications/${notificationId}`, 'PUT', notificationData);
    },

    /**
     * Удаление уведомления
     * @param {string} notificationId - ID уведомления
     * @returns {Promise<Object>} - результат операции
     */
    async deleteNotification(notificationId) {
        return request(`/admin/notifications/${notificationId}`, 'DELETE');
    },

    /**
     * Отметка уведомления как прочитанного
     * @param {string} notificationId - ID уведомления
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - результат операции
     */
    async markNotificationAsRead(notificationId, userId) {
        return request(`/notifications/${notificationId}/read`, 'POST', { userId });
    },

    // ЗАДАНИЯ
    // =======

    /**
     * Получение списка всех заданий
     * @returns {Promise<Array>} - список заданий
     */
    async getTasks() {
        return request('/admin/tasks');
    },

    /**
     * Создание нового задания
     * @param {Object} taskData - данные задания
     * @returns {Promise<Object>} - созданное задание
     */
    async createTask(taskData) {
        return request('/admin/tasks', 'POST', taskData);
    },

    /**
     * Получение конкретного задания
     * @param {string} taskId - ID задания
     * @returns {Promise<Object>} - данные задания
     */
    async getTask(taskId) {
        return request(`/admin/tasks/${taskId}`);
    },

    /**
     * Обновление задания
     * @param {string} taskId - ID задания
     * @param {Object} taskData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные задания
     */
    async updateTask(taskId, taskData) {
        return request(`/admin/tasks/${taskId}`, 'PUT', taskData);
    },

    /**
     * Удаление задания
     * @param {string} taskId - ID задания
     * @returns {Promise<Object>} - результат операции
     */
    async deleteTask(taskId) {
        return request(`/admin/tasks/${taskId}`, 'DELETE');
    },

    // НАСТРОЙКИ
    // =========

    /**
     * Получение настроек игры
     * @returns {Promise<Object>} - настройки игры
     */
    async getGameSettings() {
        return request('/settings');
    },

    /**
     * Обновление настроек игры
     * @param {Object} settings - новые настройки
     * @returns {Promise<Object>} - обновленные настройки
     */
    async updateGameSettings(settings) {
        return request('/settings', 'PUT', settings);
    },

    // ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС
    // =========================

    /**
     * Получение продуктов для конкретного пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Array>} - список доступных продуктов
     */
    async getUserProducts(userId) {
        return request(`/users/${userId}/products`);
    },

    /**
     * Получение заданий для конкретного пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Array>} - список доступных заданий
     */
    async getUserTasks(userId) {
        return request(`/users/${userId}/tasks`);
    },

    /**
     * Выполнение задания пользователем
     * @param {string} userId - ID пользователя
     * @param {string} taskId - ID задания
     * @returns {Promise<Object>} - результат выполнения задания
     */
    async completeTask(userId, taskId) {
        return request(`/users/${userId}/tasks/${taskId}/complete`, 'POST');
    },

    /**
     * Обновление уровня энергии пользователя
     * @param {string} userId - ID пользователя
     * @param {number} amount - количество использованной энергии
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async updateUserEnergy(userId, amount) {
        return request(`/users/${userId}/energy`, 'POST', { amount });
    },

    /**
     * Получение хронологии действий пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Array>} - список действий
     */
    async getUserActivityLog(userId) {
        return request(`/users/${userId}/activity`);
    },

    /**
     * Покупка бустера пользователем
     * @param {string} userId - ID пользователя
     * @param {string} boosterId - ID бустера
     * @returns {Promise<Object>} - результат покупки
     */
    async purchaseBooster(userId, boosterId) {
        return request(`/users/${userId}/boosters`, 'POST', { boosterId });
    },

    /**
     * Совершение нажатия (клика) пользователем
     * @param {string} userId - ID пользователя
     * @param {number} count - количество кликов
     * @returns {Promise<Object>} - результат операции
     */
    async recordTaps(userId, count = 1) {
        return request(`/users/${userId}/taps`, 'POST', { count });
    },

    /**
     * Получение реферальной ссылки пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - данные реферальной ссылки
     */
    async getUserReferralLink(userId) {
        return request(`/users/${userId}/referral-link`);
    },

    // ИНВЕСТИЦИИ
    // ==========

    /**
     * Получение доступных инвестиций
     * @param {string} userId - ID пользователя
     * @returns {Promise<Array>} - список доступных инвестиций
     */
    async getAvailableInvestments(userId) {
        return request(`/users/${userId}/investments/available`);
    },

    /**
     * Покупка инвестиции пользователем
     * @param {string} userId - ID пользователя
     * @param {string} investmentId - ID инвестиции
     * @returns {Promise<Object>} - результат покупки
     */
    async purchaseInvestment(userId, investmentId) {
        return request(`/users/${userId}/investments`, 'POST', { investmentId });
    },

    /**
     * Улучшение существующей инвестиции
     * @param {string} userId - ID пользователя
     * @param {string} investmentId - ID инвестиции
     * @returns {Promise<Object>} - результат улучшения
     */
    async upgradeInvestment(userId, investmentId) {
        return request(`/users/${userId}/investments/${investmentId}/upgrade`, 'POST');
    }
};

export default ApiService;