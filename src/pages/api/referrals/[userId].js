// pages/api/referrals/[userId].js
import dbConnect from '../../../lib/dbConnect';
import Referral from '../../../models/Referral';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        const { userId } = req.query;

        const referrals = await Referral.find({ referrerId: userId });
        res.status(200).json(referrals);
    } catch (error) {
        res.status(500).json({ message: 'Error getting referrals', error: error.message });
    }
}