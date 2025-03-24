// src/services/apiService.js

// Константы
const API_URL = 'https://tg-game-tab-server.onrender.com'; // Прямой URL к серверу (без /api на конце)
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
    console.log(`[DEBUG] Полный URL: ${fullUrl}`);
    if (data) {
        console.log('Данные запроса:', data);
    }

    // Настройки запроса
    const fetchOptions = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        },

        // Убираем credentials: 'include', так как это вызывает проблемы с CORS
        // credentials: 'include',
        ...options

    };

    // Добавляем тело запроса для методов не-GET
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(data);
    }

    // Логирование в режиме разработки
    if (DEBUG) {
        console.log(`📡 API Request: ${method} ${url}`);
        console.log('Options:', fetchOptions);
        if (data) console.log('Data:', data);
    }

    try {
        // Проверка наличия интернет-соединения
        if (!navigator.onLine) {
            throw new Error('Отсутствует подключение к интернету.');
        }

        // Выполняем запрос
        const response = await fetch(fullUrl, fetchOptions);
        console.log(`Статус ответа: ${response.status}`);
        console.log('Заголовки ответа:', Object.fromEntries([...response.headers]));

        // Получаем текст ответа
        const responseText = await response.text();
        console.log('Текст ответа (первые 1000 символов):', responseText.slice(0, 1000));

        // Если ответ пустой, возвращаем успех без данных
        if (!responseText) {
            return { success: true };
        }

        // Пробуем распарсить JSON
        try {
            const result = JSON.parse(responseText);

            // Проверка на ошибки
            if (!response.ok || (result.success === false)) {
                const errorMessage = result.error || result.message || `HTTP ошибка: ${response.status}`;
                throw new Error(errorMessage);
            }

            return result; // Возвращаем весь результат
        } catch (jsonError) {
            console.error('Ошибка разбора JSON:', jsonError);
            throw new Error(`Ошибка разбора ответа сервера: ${jsonError.message}`);
        }

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

        return request(`/api/admin/users?${queryParams}`);
    },

    /**
     * Получение данных конкретного пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - данные пользователя
     */
    async getUser(userId) {
        return request(`/api/admin/users/${userId}`);
    },

    /**
     * Обновление данных пользователя
     * @param {string} userId - ID пользователя
     * @param {Object} userData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async updateUser(userId, userData) {
        return request(`/api/admin/users/${userId}`, 'PUT', userData);
    },

    /**
     * Блокировка/разблокировка пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async blockUser(userId) {
        return request(`/api/admin/users/actions`, 'POST', {
            action: 'block',
            userId
        });
    },

    /**
     * Сброс прогресса пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async resetUserProgress(userId) {
        return request(`/api/admin/users/actions`, 'POST', {
            action: 'reset',
            userId
        });
    },

    // ПРОДУКТЫ
    // ========

    /**
     * Получение списка всех продуктов
     * @returns {Promise<Array>} - список продуктов
     */
    async getProducts() {
        return request('/api/admin/products');
    },

    /**
     * Создание нового продукта
     * @param {Object} productData - данные продукта
     * @returns {Promise<Object>} - созданный продукт
     */
    async createProduct(productData) {
        console.log('Отправка данных продукта:', productData); // Добавьте логирование

        try {
            // Убедитесь, что contentType правильный и данные форматируются как JSON
            const response = await request('/api/admin/products', 'POST', productData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error('Детали ошибки создания продукта:', error);
            throw error;
        }
    },

    /**
     * Получение данных конкретного продукта
     * @param {string} productId - ID продукта
     * @returns {Promise<Object>} - данные продукта
     */
    async getProduct(productId) {
        return request(`/api/admin/products/${productId}`);
    },

    /**
     * Обновление данных продукта
     * @param {string} productId - ID продукта
     * @param {Object} productData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные продукта
     */
    async updateProduct(productId, productData) {
        return request(`/api/admin/products/${productId}`, 'PUT', productData);
    },

    /**
     * Удаление продукта
     * @param {string} productId - ID продукта
     * @returns {Promise<Object>} - результат операции
     */
    async deleteProduct(productId) {
        return request(`/api/admin/products/${productId}`, 'DELETE');
    },

    /**
     * Изменение порядка отображения продуктов
     * @param {Array<string>} orderedIds - массив ID продуктов в нужном порядке
     * @returns {Promise<Array>} - обновленный список продуктов
     */
    async reorderProducts(orderedIds) {
        return request('/api/admin/products/reorder', 'POST', { orderedIds });
    },

    /**
     * Получение заявок на продукт
     * @param {string} productId - ID продукта
     * @returns {Promise<Array>} - список заявок
     */
    async getProductClaims(productId) {
        return request(`/api/admin/products/${productId}/claims`);
    },

    /**
     * Получение последних заявок на продукты
     * @returns {Promise<Array>} - список последних заявок
     */
    async getRecentClaims() {
        return request('/api/admin/products/claims/recent');
    },

    /**
     * Обновление статуса заявки
     * @param {string} claimId - ID заявки
     * @param {string} status - новый статус
     * @param {Object} additionalData - дополнительные данные (примечание и др.)
     * @returns {Promise<Object>} - обновленные данные заявки
     */
    async updateClaimStatus(claimId, status, additionalData = {}) {
        return request(`/api/admin/products/claims/${claimId}`, 'PUT', {
            status,
            ...additionalData
        });
    },

    // УВЕДОМЛЕНИЯ
    // ===========

    /**
     * Получение истории уведомлений
     * @returns {Promise<Array>} - список уведомлений
     */
    async getNotificationsHistory() {
        return request('/api/admin/notifications');
    },

    /**
     * Получение статистики по уведомлениям
     * @returns {Promise<Object>} - статистика уведомлений
     */
    async getNotificationStats() {
        return request('/api/admin/notifications/stats');
    },

    /**
     * Отправка уведомления
     * @param {Object} notificationData - данные уведомления
     * @returns {Promise<Object>} - результат отправки
     */
    async sendNotification(notificationData) {
        return request('/api/notifications/send', 'POST', notificationData);
    },

    /**
     * Тестовая отправка уведомления
     * @param {Object} notificationData - данные уведомления
     * @returns {Promise<Object>} - результат отправки
     */
    async sendTestNotification(notificationData) {
        return request('/api/notifications/test', 'POST', notificationData);
    },

    /**
     * Обновление уведомления
     * @param {string} notificationId - ID уведомления
     * @param {Object} notificationData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные уведомления
     */
    async updateNotification(notificationId, notificationData) {
        return request(`/api/admin/notifications/${notificationId}`, 'PUT', notificationData);
    },

    /**
     * Удаление уведомления
     * @param {string} notificationId - ID уведомления
     * @returns {Promise<Object>} - результат операции
     */
    async deleteNotification(notificationId) {
        return request(`/api/admin/notifications/${notificationId}`, 'DELETE');
    },

    // ЗАДАНИЯ
    // =======

    /**
     * Получение списка всех заданий
     * @returns {Promise<Array>} - список заданий
     */
    async getTasks() {
        return request('/api/admin/tasks');
    },

    /**
     * Создание нового задания
     * @param {Object} taskData - данные задания
     * @returns {Promise<Object>} - созданное задание
     */
    async createTask(taskData) {
        return request('/api/admin/tasks', 'POST', taskData);
    },

    /**
     * Получение конкретного задания
     * @param {string} taskId - ID задания
     * @returns {Promise<Object>} - данные задания
     */
    async getTask(taskId) {
        return request(`/api/admin/tasks/${taskId}`);
    },

    /**
     * Обновление задания
     * @param {string} taskId - ID задания
     * @param {Object} taskData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные задания
     */
    async updateTask(taskId, taskData) {
        return request(`/api/admin/tasks/${taskId}`, 'PUT', taskData);
    },

    /**
     * Удаление задания
     * @param {string} taskId - ID задания
     * @returns {Promise<Object>} - результат операции
     */
    async deleteTask(taskId) {
        return request(`/api/admin/tasks/${taskId}`, 'DELETE');
    },

    // НАСТРОЙКИ
    // =========

    /**
     * Получение настроек игры
     * @returns {Promise<Object>} - настройки игры
     */
    async getGameSettings() {
        return request('/api/settings');
    },

    /**
     * Обновление настроек игры
     * @param {Object} settings - новые настройки
     * @returns {Promise<Object>} - обновленные настройки
     */
    async updateGameSettings(settings) {
        return request('/api/settings', 'PUT', settings);
    },

    // СТАТИСТИКА
    // ==========

    /**
     * Получение общей статистики
     * @returns {Promise<Object>} - объект со статистикой
     */
    async getStats() {
        return request('/api/admin/stats');
    }
};

export default ApiService;