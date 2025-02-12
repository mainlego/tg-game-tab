// src/composables/useTelegram.js
import { ref, onMounted } from 'vue'

export function useTelegram() {
    const tg = window.Telegram.WebApp
    const user = ref(null)
    const ready = ref(false)

    onMounted(() => {
        // Инициализация
        tg.ready()
        ready.value = true
        user.value = tg.initDataUnsafe?.user

        // Настраиваем внешний вид
        tg.expand()
        tg.enableClosingConfirmation()

        // Устанавливаем основной цвет
        tg.setHeaderColor('#8C60E3')
        tg.setBackgroundColor('#08070d')
    })

    // Методы для работы с Telegram Mini App
    const showAlert = (message) => {
        tg.showAlert(message)
    }

    const showConfirm = (message) => {
        return tg.showConfirm(message)
    }

    const close = () => {
        tg.close()
    }

    // Методы для работы с MainButton
    const showMainButton = (text) => {
        tg.MainButton.text = text
        tg.MainButton.show()
    }

    const hideMainButton = () => {
        tg.MainButton.hide()
    }

    const setMainButtonLoader = (loading) => {
        if (loading) {
            tg.MainButton.showProgress()
        } else {
            tg.MainButton.hideProgress()
        }
    }

    return {
        tg,
        user,
        ready,
        showAlert,
        showConfirm,
        close,
        showMainButton,
        hideMainButton,
        setMainButtonLoader
    }
}