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

    // Настройки запроса
    const fetchOptions = {
        method,
        // Начинаем с пустого объекта заголовков или используем переданные
        headers: options.headers || {},
        ...options
    };

    // Добавляем тело запроса для методов не-GET
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        // Если данные не FormData, преобразуем в JSON
        if (!(data instanceof FormData)) {
            fetchOptions.body = JSON.stringify(data);
            // Устанавливаем Content-Type только для JSON
            fetchOptions.headers['Content-Type'] = 'application/json';
        } else {
            // Для FormData не устанавливаем Content-Type
            fetchOptions.body = data;
        }
    }

    // Используем body из options, если он есть
    if (options.body) {
        fetchOptions.body = options.body;
    }

    console.log(`Sending ${method} request to ${fullUrl}`, fetchOptions);

    try {
        // Проверка наличия интернет-соединения
        if (!navigator.onLine) {
            throw new Error('Отсутствует подключение к интернету.');
        }

        // Выполняем запрос
        const response = await fetch(fullUrl, fetchOptions);

        console.log(`Response status: ${response.status}`);

        // Получаем текст ответа
        const responseText = await response.text();

        // Если ответ пустой и статус успешный
        if (!responseText && response.status >= 200 && response.status < 300) {
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

            return result;
        } catch (jsonError) {
            console.error('Ошибка разбора JSON:', jsonError, 'Raw response:', responseText);

            // Если ответ не JSON, но статус успешный
            if (response.ok) {
                return { success: true, rawText: responseText };
            }

            throw new Error(`Ошибка разбора ответа сервера: ${responseText}`);
        }
    } catch (error) {
        // Обработка ошибок
        console.error(`❌ API Error (${method} ${url}):`, error);
        throw error;
    }
}

/**
 * Сервис для работы с API
 */
export const ApiService = {
    // Экспортируем API_URL для использования в других местах
    API_URL,

    // УТИЛИТЫ
    // =======


    // Добавьте эти методы в ApiService в файле apiService.js




    /**
     * Получение полного URL изображения
     * @param {string} imagePath - относительный путь к изображению
     * @returns {string} - полный URL изображения
     */
    getImageUrl(imagePath) {
        if (!imagePath) return '';

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        return `${this.API_URL}${imagePath}`;
    },

    /**
     * Создание нового продукта с изображением
     * @param {FormData} formData - данные продукта с файлом
     * @returns {Promise<Object>} - созданный продукт
     */
    async createProductWithImage(formData) {
        // Добавляем отладочный вывод
        console.log('Creating product with image, formData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[0] === 'productImage' ? '[File]' : pair[1]));
        }

        return request('/api/admin/products/upload', 'POST', null, {
            headers: {
                // Важно: НЕ устанавливаем Content-Type для FormData
                'Accept': 'application/json'
            },
            // Передаем FormData как body
            body: formData
        });
    },




    /**
     * Обновление продукта с изображением
     * @param {string} productId - ID продукта
     * @param {FormData} formData - данные продукта с файлом
     * @returns {Promise<Object>} - обновленный продукт
     */
    async updateProductWithImage(productId, formData) {
        return request(`/api/admin/products/${productId}/upload`, 'PUT', null, {
            // Убираем настройки headers полностью, пусть браузер сам установит нужные заголовки
            body: formData
        });
    },



    /**
     * Создание нового задания с изображением
     * @param {FormData} formData - данные задания с файлом (включая title, description, link, type, reward, active, requirements)
     * @returns {Promise<Object>} - созданное задание
     */
    async createTaskWithImage(formData) {
        // Добавляем отладочный вывод
        console.log('Creating task with image, formData entries:');
        for (let pair of formData.entries()) {
            // Скрываем содержимое файла и показываем для других полей
            const value = ['taskImage'].includes(pair[0]) ? '[File]' : pair[1];
            console.log(`${pair[0]}: ${value}`);
        }

        return request('/api/admin/tasks/upload', 'POST', null, {
            headers: {
                // Важно: НЕ устанавливаем Content-Type для FormData
                'Accept': 'application/json'
            },
            // Передаем FormData как body
            body: formData
        });
    },

    /**
     * Обновление задания с изображением
     * @param {string} taskId - ID задания
     * @param {FormData} formData - данные задания с файлом (включая link для реферальной/переходной ссылки)
     * @returns {Promise<Object>} - обновленное задание
     */
    async updateTaskWithImage(taskId, formData) {
        // Добавляем отладочный вывод для помощи в диагностике
        console.log(`Updating task ${taskId} with image, formData entries:`);
        for (let pair of formData.entries()) {
            // Скрываем содержимое файла и показываем для других полей
            const value = ['taskImage'].includes(pair[0]) ? '[File]' : pair[1];
            console.log(`${pair[0]}: ${value}`);
        }

        // Убираем настройки headers полностью, пусть браузер сам установит нужные заголовки
        return request(`/api/admin/tasks/${taskId}/upload`, 'PUT', null, {
            body: formData
        });
    },

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
     * Безопасное обновление данных пользователя
     * @param {string} userId - ID пользователя
     * @param {Object} userData - данные для обновления
     * @returns {Promise<Object>} - обновленные данные пользователя
     */
    async updateUser(userId, userData) {
        try {
            if (!userId) {
                throw new Error("ID пользователя не может быть пустым");
            }

            // Создаем безопасную копию данных, исключая проблемные поля
            const safeData = this.prepareSafeUserData(userData);

            // Вызываем API
            const result = await request(`/api/admin/users/${userId}`, 'PUT', safeData);
            return result;
        } catch (error) {
            console.error(`Ошибка обновления пользователя ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Подготовка безопасных данных для обновления пользователя
     * @param {Object} userData - исходные данные пользователя
     * @returns {Object} - безопасные данные для отправки
     */
    prepareSafeUserData(userData) {
        // Создаем пустой объект для безопасных данных
        const safeData = {};

        // Копируем все поля кроме gameData (его обработаем отдельно)
        Object.entries(userData).forEach(([key, value]) => {
            if (key !== 'gameData') {
                safeData[key] = value;
            }
        });

        // Если есть gameData, обрабатываем его безопасно
        if (userData.gameData) {
            safeData.gameData = {};

            // Основные поля
            if (userData.gameData.balance !== undefined) {
                safeData.gameData.balance = Number(userData.gameData.balance);
            }

            if (userData.gameData.passiveIncome !== undefined) {
                safeData.gameData.passiveIncome = Number(userData.gameData.passiveIncome);
            }

            if (userData.gameData.tutorialCompleted !== undefined) {
                safeData.gameData.tutorialCompleted = Boolean(userData.gameData.tutorialCompleted);
            }

            // Энергия
            if (userData.gameData.energy) {
                safeData.gameData.energy = {
                    current: Number(userData.gameData.energy.current) || 0,
                    max: Number(userData.gameData.energy.max) || 100,
                    regenRate: Number(userData.gameData.energy.regenRate) || 1,
                    lastRegenTime: Number(userData.gameData.energy.lastRegenTime) || Date.now()
                };
            }

            // Уровень
            if (userData.gameData.level) {
                safeData.gameData.level = {
                    current: Number(userData.gameData.level.current) || 1,
                    max: Number(userData.gameData.level.max) || 10,
                    progress: Number(userData.gameData.level.progress) || 0,
                    title: String(userData.gameData.level.title || 'Новичок')
                };
            }

            // Множители
            if (userData.gameData.multipliers) {
                safeData.gameData.multipliers = {
                    tapValue: Number(userData.gameData.multipliers.tapValue) || 1,
                    tapMultiplier: Number(userData.gameData.multipliers.tapMultiplier) || 1,
                    incomeBoost: Number(userData.gameData.multipliers.incomeBoost) || 1
                };
            }

            // Бусты
            if (userData.gameData.boosts) {
                safeData.gameData.boosts = {
                    tap3x: {
                        active: Boolean(userData.gameData.boosts.tap3x?.active),
                        endTime: userData.gameData.boosts.tap3x?.endTime
                    },
                    tap5x: {
                        active: Boolean(userData.gameData.boosts.tap5x?.active),
                        endTime: userData.gameData.boosts.tap5x?.endTime
                    }
                };
            }

            // Статистика
            if (userData.gameData.stats) {
                safeData.gameData.stats = {
                    totalClicks: Number(userData.gameData.stats.totalClicks) || 0,
                    totalEarned: Number(userData.gameData.stats.totalEarned) || 0,
                    maxPassiveIncome: Number(userData.gameData.stats.maxPassiveIncome) || 0
                };
            }

            // Инвестиции - особая обработка
            if (userData.gameData.investments) {
                safeData.gameData.investments = {
                    // ВАЖНО: используем пустой массив вместо actual инвестиций
                    purchased: [],
                    activeIncome: Number(userData.gameData.investments.activeIncome) || 0,
                    lastCalculation: new Date().toISOString()
                };
            }
        }

        return safeData;
    },

    /**
     * Обновление только основных данных пользователя (облегченная версия)
     * @param {string} userId - ID пользователя
     * @param {Object} basicData - базовые данные для обновления
     * @returns {Promise<Object>} - результат обновления
     */
    async updateUserBasics(userId, basicData) {
        const { balance, passiveIncome, level } = basicData;

        const minimalData = {
            gameData: {
                balance: Number(balance) || 0,
                passiveIncome: Number(passiveIncome) || 0
            },
            lastLogin: new Date().toISOString()
        };

        if (level) {
            minimalData.gameData.level = {
                current: Number(level.current) || 1,
                progress: Number(level.progress) || 0,
                title: String(level.title || 'Новичок')
            };
        }

        return request(`/api/admin/users/${userId}`, 'PUT', minimalData);
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
        return request('/api/admin/products', 'POST', productData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
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
        try {
            if (!productId) {
                throw new Error('ID продукта не указан');
            }

            console.log(`Запрос заявок для продукта ${productId}`);
            const response = await request(`/api/admin/products/${productId}/claims`);

            // Для отладки выводим полный ответ
            console.log(`Полный ответ API при загрузке заявок для продукта ${productId}:`, response);

            if (response && response.success && response.data) {
                return response;
            } else if (Array.isArray(response)) {
                return { success: true, data: response };
            }

            console.warn('Неожиданный формат ответа при загрузке заявок продукта:', response);
            return { success: false, data: [] };
        } catch (error) {
            console.error(`Ошибка при получении заявок для продукта ${productId}:`, error);
            throw error;
        }
    },

    /**
     * Получение последних заявок на продукты
     * @returns {Promise<Array>} - список последних заявок
     */
    /**
     * Получение последних заявок на продукты
     * @returns {Promise<Array>} - список последних заявок
     */
    async getRecentClaims() {
        try {
            const response = await request('/api/admin/products/claims/recent');

            // Для отладки выводим полный ответ
            console.log('Полный ответ API при загрузке последних заявок:', response);

            if (response && response.success && response.data) {
                return response;
            } else if (Array.isArray(response)) {
                return { success: true, data: response };
            }

            console.warn('Неожиданный формат ответа при загрузке заявок:', response);
            return { success: false, data: [] };
        } catch (error) {
            console.error('Ошибка при получении последних заявок:', error);
            throw error;
        }
    },

    /**
     * Обновление статуса заявки
     * @param {string} claimId - ID заявки
     * @param {string} status - новый статус
     * @param {Object} additionalData - дополнительные данные (примечание и др.)
     * @returns {Promise<Object>} - обновленные данные заявки
     */
    async updateClaimStatus(claimId, status, additionalData = {}) {
        try {
            if (!claimId) {
                throw new Error('ID заявки не указан');
            }

            console.log(`Обновление статуса заявки ${claimId} на ${status}`, additionalData);

            const response = await request(`/api/admin/products/claims/${claimId}`, 'PUT', {
                status,
                ...additionalData
            });

            // Для отладки выводим полный ответ
            console.log(`Ответ API при обновлении статуса заявки ${claimId}:`, response);

            return response;
        } catch (error) {
            console.error(`Ошибка при обновлении статуса заявки ${claimId}:`, error);
            throw error;
        }
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
     * @param {Object} taskData - данные задания (включает title, description, type, reward, link для реферальной ссылки)
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
     * @param {Object} taskData - данные для обновления (может включать link для реферальной ссылки)
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