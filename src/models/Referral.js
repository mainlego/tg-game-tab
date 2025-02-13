// models/Referral.js
const ReferralSchema = new mongoose.Schema({
    referrerId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    userData: {
        first_name: String,
        last_name: String,
        username: String,
        photo_url: String
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    rewardClaimed: {
        type: Boolean,
        default: false
    }
});