// pages/api/notifications/test.js
import { bot } from '@/services/telegramBot'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        })
    }

    try {
        const { message, important, testUserId } = req.body

        if (!testUserId) {
            throw new Error('Test user ID is required')
        }

        // Форматируем сообщение
        let formattedMessage = '[TEST] '
        if (important) {
            formattedMessage += '🔔 ВАЖНО!\n\n'
        }
        formattedMessage += message

        // Отправляем тестовое сообщение
        await bot.sendMessage(testUserId, formattedMessage, {
            parse_mode: 'HTML'
        })

        res.status(200).json({
            success: true,
            message: 'Test notification sent successfully'
        })
    } catch (error) {
        console.error('Error sending test notification:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}