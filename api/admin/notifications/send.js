// pages/api/admin/notifications/send.js
import dbConnect from '@/lib/dbConnect'
import Notification from '@/models/Notification'
import User from '@/models/User'
import { TelegramService } from '@/services/telegramService'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }

    await dbConnect()

    try {
        const { type, message, important, conditions, button } = req.body

        // Находим целевых пользователей
        let targetQuery = {}
        if (type === 'level' && conditions?.minLevel) {
            targetQuery['gameData.level.current'] = { $gte: conditions.minLevel }
        }
        if (type === 'income' && conditions?.minIncome) {
            targetQuery['gameData.passiveIncome'] = { $gte: conditions.minIncome }
        }

        const targetUsers = await User.find(targetQuery).select('telegramId')
        const targetUserIds = targetUsers.map(user => user.telegramId)

        // Создаем уведомление в базе
        const notification = await Notification.create({
            type,
            message,
            important,
            conditions,
            button,
            stats: {
                sentCount: targetUserIds.length,
                readCount: 0,
                targetUsers: targetUserIds
            },
            status: 'sending',
            sentAt: new Date()
        })

        // Форматируем сообщение
        const formattedMessage = TelegramService.formatMessage({
            message,
            important,
            button
        })

        // Отправляем уведомления через Telegram
        const sendResults = await TelegramService.sendBulkNotifications(
            targetUserIds,
            formattedMessage,
            button ? {
                reply_markup: {
                    inline_keyboard: [[
                        { text: button.text, url: button.url }
                    ]]
                }
            } : {}
        )

        // Обновляем статистику
        await Notification.findByIdAndUpdate(notification._id, {
            status: 'sent',
            'stats.sentCount': sendResults.success,
            'stats.failedCount': sendResults.failed,
            'stats.failures': sendResults.failures
        })

        res.status(200).json({
            success: true,
            data: {
                notification,
                sendResults
            }
        })
    } catch (error) {
        console.error('Error sending notification:', error)
        res.status(400).json({ success: false, error: error.message })
    }
}