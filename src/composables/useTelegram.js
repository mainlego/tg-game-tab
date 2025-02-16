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
            if (tg.initDataUnsafe?.user) {
                user.value = tg.initDataUnsafe.user
                console.log('Telegram init data:', tg.initData)
                console.log('Telegram user data:', user.value)
            } else {
                // Для тестирования локально можно использовать моковые данные
                user.value = {
                    id: '12345',
                    first_name: 'Test',
                    last_name: 'User',
                    username: 'testuser',
                    language_code: 'ru'
                }
                console.log('Using mock user data:', user.value)
            }
        } else {
            console.warn('Telegram WebApp is not available')
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
        tg: ref(tg),
        user,
        ready,
        showMessage
    }
}