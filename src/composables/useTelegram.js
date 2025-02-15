// src/composables/useTelegram.js
import { ref, onMounted } from 'vue'
import { UserService } from '@/services/userService'

export function useTelegram() {
    const tg = window.Telegram?.WebApp
    const user = ref(null)
    const ready = ref(false)

    onMounted(() => {
        if (tg) {
            tg.ready()
            ready.value = true

            // Получаем данные пользователя из Telegram
            const telegramUser = tg.initDataUnsafe?.user
            if (telegramUser) {
                // Регистрируем или обновляем пользователя
                const savedUser = UserService.saveUser({
                    id: telegramUser.id,
                    first_name: telegramUser.first_name,
                    last_name: telegramUser.last_name,
                    username: telegramUser.username,
                    language_code: telegramUser.language_code,
                    photo_url: telegramUser.photo_url
                })
                user.value = savedUser
            }

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