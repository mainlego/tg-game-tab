// src/services/storage.js
const STORAGE_KEY = 'game_state'

export const StorageService = {
    saveState(state) {
        try {
            const serializedState = JSON.stringify(state)
            localStorage.setItem(STORAGE_KEY, serializedState)
            console.log('Game state saved successfully')
        } catch (err) {
            console.error('Could not save state:', err)
        }
    },

    loadState() {
        try {
            const serializedState = localStorage.getItem(STORAGE_KEY)
            if (serializedState === null) {
                return undefined
            }
            const state = JSON.parse(serializedState)

            // Проверяем время последнего сохранения
            if (state.lastSaved) {
                const lastSaved = new Date(state.lastSaved)
                const now = new Date()
                // Если прошло больше недели, сбрасываем сохранение
                if (now - lastSaved > 7 * 24 * 60 * 60 * 1000) {
                    this.clearState()
                    return undefined
                }
            }

            return state
        } catch (err) {
            console.error('Could not load state:', err)
            return undefined
        }
    },

    clearState() {
        try {
            localStorage.removeItem(STORAGE_KEY)
            console.log('Game state cleared')
        } catch (err) {
            console.error('Could not clear state:', err)
        }
    },

    // Добавим метод для обновления отдельных полей
    updateState(updates) {
        try {
            const currentState = this.loadState() || {}
            const newState = { ...currentState, ...updates }
            this.saveState(newState)
            return true
        } catch (err) {
            console.error('Could not update state:', err)
            return false
        }
    }
}