// pages/api/referrals/index.js
import { MongoClient } from 'mongodb';

// Инициализация MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    log('API request received:', {
        method: req.method,
        body: req.body
    });

    // Проверяем метод
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Проверяем подключение к MongoDB
        log('MongoDB URI exists:', !!uri);

        await client.connect();
        await client.db("admin").command({ ping: 1 });
        log("MongoDB connected successfully");

        const db = client.db('game-db'); // Название вашей базы данных
        const referrals = db.collection('referrals');

        const { referrerId, userId, userData } = req.body;
        log('Processing referral data:', { referrerId, userId, userData });

        // Проверяем существующего реферала
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

        log('Referral saved:', result);
        res.status(201).json(result);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
}