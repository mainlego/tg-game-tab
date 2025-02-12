// src/services/referralService.js
const REFERRALS_KEY = 'game_referrals'
const REFERRER_KEY = 'user_referrer'

export const ReferralService = {
    // Сохранение реферала
    saveReferral(referrerId, userId, userData) {
        const referrals = this.getAllReferrals()

        if (!referrals[referrerId]) {
            referrals[referrerId] = []
        }

        // Проверяем, не добавлен ли уже этот реферал
        if (!referrals[referrerId].find(ref => ref.id === userId)) {
            referrals[referrerId].push({
                id: userId,
                ...userData,
                joinedAt: new Date().toISOString()
            })
            localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals))
        }
    },

    // Получение всех рефералов
    getAllReferrals() {
        const referrals = localStorage.getItem(REFERRALS_KEY)
        return referrals ? JSON.parse(referrals) : {}
    },

    // Получение рефералов конкретного пользователя
    getUserReferrals(userId) {
        const referrals = this.getAllReferrals()
        return referrals[userId] || []
    },

    // Сохранение реферера для нового пользователя
    saveReferrer(referrerId) {
        localStorage.setItem(REFERRER_KEY, referrerId)
    },

    // Получение ID реферера
    getReferrer() {
        return localStorage.getItem(REFERRER_KEY)
    },

    // Создание реферальной ссылки
    createReferralLink(userId) {
        const baseUrl = window.location.origin
        return `${baseUrl}?ref=${userId}`
    }
}