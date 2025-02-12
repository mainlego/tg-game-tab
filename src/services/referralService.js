// src/services/referralService.js
const REFERRALS_KEY = 'game_referrals'
const REWARDS_STATE_KEY = 'rewards_state'

export const ReferralService = {
    // Сохранение нового реферала
    saveReferral(referrerId, userData) {
        try {
            const referrals = this.getAllReferrals()
            if (!referrals[referrerId]) {
                referrals[referrerId] = []
            }

            // Проверяем, нет ли уже такого реферала
            const existingReferral = referrals[referrerId].find(ref => ref.id === userData.id)
            if (!existingReferral) {
                referrals[referrerId].push({
                    ...userData,
                    joinedAt: new Date().toISOString(),
                    rewardClaimed: false // Флаг для отслеживания выплаты награды
                })
                localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals))
                return true
            }
            return false
        } catch (error) {
            console.error('Error saving referral:', error)
            return false
        }
    },

    // Получение всех рефералов пользователя
    getUserReferrals(userId) {
        try {
            const referrals = this.getAllReferrals()
            return referrals[userId] || []
        } catch (error) {
            console.error('Error getting user referrals:', error)
            return []
        }
    },

    // Получение всех рефералов
    getAllReferrals() {
        try {
            const referrals = localStorage.getItem(REFERRALS_KEY)
            return referrals ? JSON.parse(referrals) : {}
        } catch (error) {
            console.error('Error getting all referrals:', error)
            return {}
        }
    },

    // Отметка о выплате награды за реферала
    markRewardClaimed(referrerId, referralId) {
        try {
            const referrals = this.getAllReferrals()
            if (referrals[referrerId]) {
                const referral = referrals[referrerId].find(ref => ref.id === referralId)
                if (referral) {
                    referral.rewardClaimed = true
                    localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals))
                    return true
                }
            }
            return false
        } catch (error) {
            console.error('Error marking reward claimed:', error)
            return false
        }
    },

    // Проверка статуса наград
    getRewardsState(userId) {
        try {
            const key = `${REWARDS_STATE_KEY}_${userId}`
            const state = localStorage.getItem(key)
            return state ? JSON.parse(state) : null
        } catch (error) {
            console.error('Error getting rewards state:', error)
            return null
        }
    },

    // Сохранение статуса наград
    saveRewardsState(userId, state) {
        try {
            const key = `${REWARDS_STATE_KEY}_${userId}`
            localStorage.setItem(key, JSON.stringify(state))
            return true
        } catch (error) {
            console.error('Error saving rewards state:', error)
            return false
        }
    }
}