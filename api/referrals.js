// api/referrals.js
import { MongoClient } from 'mongodb';
import dbConnect from '../../lib/dbConnect.js';
import Referral from '../../models/Referral.js';

// Добавляем CORS middleware
const corsMiddleware = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
};

export default async function handler(req, res) {
    await corsMiddleware(req, res);

    try {
        await dbConnect();

        switch (req.method) {
            case 'POST':
                // Обработка создания реферала
                const { referrerId, userId, userData } = req.body;

                const newReferral = new Referral({
                    referrerId,
                    userId,
                    userData,
                    joinedAt: new Date(),
                    rewardClaimed: false
                });

                await newReferral.save();
                return res.status(200).json({ success: true, data: newReferral });

            case 'GET':
                // Получение списка рефералов
                const referrals = await Referral.find({ referrerId: req.query.userId });
                return res.status(200).json(referrals);

            default:
                res.setHeader('Allow', ['POST', 'GET']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}