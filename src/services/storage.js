// src/services/storage.js

/**
 * Сервис для работы с localStorage
 */
export const StorageService = {
    /**
     * Сохранение состояния в localStorage
     * @param {Object} state - состояние для сохранения
     */
    saveState(state) {
        try {
            // Проверяем корректность данных энергии перед сохранением
            if (state.energy && (!state.energy.lastRegenTime || isNaN(state.energy.lastRegenTime))) {
                console.warn('Некорректное значение lastRegenTime, устанавливаем текущее время');
                state.energy.lastRegenTime = Date.now();
            }

            const stateString = JSON.stringify(state);
            localStorage.setItem('gameState', stateString);
            return true;
        } catch (error) {
            console.error('Error saving state to localStorage:', error);
            return false;
        }
    },

    /**
     * Загрузка состояния из localStorage
     * @returns {Object|null} - загруженное состояние или null в случае ошибки
     */
    loadState() {
        try {
            const stateString = localStorage.getItem('gameState');
            if (!stateString) return null;

            const state = JSON.parse(stateString);

            // Проверяем и фиксируем некорректные данные
            if (state.energy && (!state.energy.lastRegenTime || isNaN(state.energy.lastRegenTime))) {
                console.warn('Обнаружено некорректное значение lastRegenTime при загрузке, исправляем');
                state.energy.lastRegenTime = Date.now();
            }

            return state;
        } catch (error) {
            console.error('Error loading state from localStorage:', error);

            // Пробуем загрузить из резервной копии
            try {
                const fallbackString = localStorage.getItem('gameStateFallback');
                if (fallbackString) {
                    console.log('Попытка восстановления из резервной копии');
                    return JSON.parse(fallbackString);
                }
            } catch (e) {
                console.error('Ошибка загрузки из резервной копии:', e);
            }

            return null;
        }
    },

    /**
     * Очистка состояния в localStorage
     */
    clearState() {
        try {
            localStorage.removeItem('gameState');
            localStorage.removeItem('gameStateFallback');
            return true;
        } catch (error) {
            console.error('Error clearing state from localStorage:', error);
            return false;
        }
    },

    /**
     * Сохранение данных пользователя для админ-панели
     * @param {Object} userData - данные пользователя для сохранения
     */
    saveAdminUser(userData) {
        try {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminUser', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Error saving admin user to localStorage:', error);
            return false;
        }
    },

    /**
     * Загрузка данных пользователя для админ-панели
     * @returns {Object|null} - данные пользователя или null в случае ошибки
     */
    loadAdminUser() {
        try {
            const isAdmin = localStorage.getItem('isAdmin');
            if (isAdmin !== 'true') return null;

            const userString = localStorage.getItem('adminUser');
            if (!userString) return { isAdmin: true };

            return { ...JSON.parse(userString), isAdmin: true };
        } catch (error) {
            console.error('Error loading admin user from localStorage:', error);
            return null;
        }
    },

    /**
     * Очистка данных пользователя для админ-панели
     */
    clearAdminUser() {
        try {
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('adminUser');
            return true;
        } catch (error) {
            console.error('Error clearing admin user from localStorage:', error);
            return false;
        }
    },

    /**
     * Сохранение настроек игры
     * @param {Object} settings - настройки игры
     */
    saveSettings(settings) {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
            return false;
        }
    },

    /**
     * Загрузка настроек игры
     * @returns {Object|null} - настройки игры или null в случае ошибки
     */
    loadSettings() {
        try {
            const settingsString = localStorage.getItem('gameSettings');
            if (!settingsString) return null;
            return JSON.parse(settingsString);
        } catch (error) {
            console.error('Error loading settings from localStorage:', error);
            return null;
        }
    }
};