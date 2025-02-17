// models/Notification.js
import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['all', 'level', 'income'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    important: {
        type: Boolean,
        default: false
    },
    conditions: {
        minLevel: {
            type: Number,
            default: 1
        },
        minIncome: {
            type: Number,
            default: 0
        }
    },
    stats: {
        sentCount: {
            type: Number,
            default: 0
        },
        readCount: {
            type: Number,
            default: 0
        },
        targetUsers: [{
            type: String  // telegramId
        }]
    },
    scheduledFor: {
        type: Date
    },
    sentAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sent', 'cancelled'],
        default: 'draft'
    }
}, {
    timestamps: true
})

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)