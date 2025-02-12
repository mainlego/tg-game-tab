// pages/api/referrals/index.js
import dbConnect from '../../../lib/dbConnect';
import Referral from '../../../models/Referral';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        const { referrerId, userId, userData } = req.body;

        // Проверяем, не является ли пользователь уже чьим-то рефералом
        const existingReferral = await Referral.findOne({ userId });
        if (existingReferral) {
            return res.status(400).json({ message: 'User already has a referrer' });
        }

        const referral = await Referral.create({
            referrerId,
            userId,
            userData
        });

        res.status(201).json(referral);
    } catch (error) {
        res.status(500).json({ message: 'Error creating referral', error: error.message });
    }
}