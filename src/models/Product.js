// models/Product.js
import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requiredIncome: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        enum: ['physical', 'digital', 'service'],
        default: 'digital'
    },
    order: {
        type: Number,
        default: 0
    },
    claimInstructions: {
        type: String,
        default: ''
    },
    claims: [{
        userId: String,
        claimedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'cancelled'],
            default: 'pending'
        }
    }]
}, {
    timestamps: true
})

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)