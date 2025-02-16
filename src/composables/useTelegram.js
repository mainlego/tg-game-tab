// src/composables/useTelegram.js
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export function useTelegram() {
    const tg = ref(window.Telegram?.WebApp || null)
    const user = ref(null)
    const ready = ref(false)
    const route = useRoute()

    onMounted(() => {
        // Проверяем, находимся ли мы в админке
        const isAdmin = route.path.startsWith('/admin')

        if (!isAdmin && tg.value) {
            try {
                tg.value.ready()
                ready.value = true

                // Получаем данные пользователя
                if (tg.value.initDataUnsafe?.user) {
                    user.value = tg.value.initDataUnsafe.user
                    console.log('Telegram init data:', tg.value.initData)
                    console.log('Telegram user data:', user.value)
                }

                // Расширяем на весь экран
                tg.value.expand()

                // Настраиваем внешний вид
                tg.value.setBackgroundColor('#08070d')
                tg.value.setHeaderColor('#1a1a1a')

                // Отключаем свайп назад для iOS
                if (tg.value.BackButton) {
                    tg.value.BackButton.hide()
                }
                if (tg.value.enableClosingConfirmation) {
                    tg.value.enableClosingConfirmation()
                }
            } catch (error) {
                console.warn('Error initializing Telegram WebApp:', error)
            }
        } else if (isAdmin) {
            // Для админки используем моковые данные
            console.log('Admin panel detected, using mock data')
            ready.value = true
        }
    })

    const showMessage = (message) => {
        if (tg.value) {
            tg.value.showPopup({
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