// src/composables/useTelegram.js
import { ref, onMounted } from 'vue'

export function useTelegram() {
    const tg = window.Telegram?.WebApp
    const user = ref(null)
    const ready = ref(false)

    onMounted(() => {
        if (tg) {
            tg.ready()
            ready.value = true
            // Получаем данные пользователя
            user.value = tg.initDataUnsafe?.user || null
            console.log('Telegram initData:', tg.initData)
            console.log('Telegram user data:', user.value)
        }
    })

    const showMessage = (message) => {
        if (tg) {
            tg.showPopup({
                message
            })
        } else {
            alert(message)
        }
    }

    return {
        tg,
        user,
        ready,
        showMessage
    }
}