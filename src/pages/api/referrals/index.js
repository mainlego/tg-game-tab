import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await client.connect();
        const db = client.db('game-db');
        const referrals = db.collection('referrals');

        const { referrerId, userId, userData } = req.body;

        // Проверяем, не является ли пользователь уже чьим-то рефералом
        const existingReferral = await referrals.findOne({ userId });
        if (existingReferral) {
            return res.status(400).json({ message: 'User already has a referrer' });
        }

        // Сохраняем нового реферала
        const result = await referrals.insertOne({
            referrerId,
            userId,
            userData,
            joinedAt: new Date(),
            rewardClaimed: false
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error saving referral' });
    } finally {
        await client.close();
    }
}