// pages/api/referrals/index.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка OPTIONS запроса для CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Проверяем метод
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed. Only POST is supported.'
        });
    }

    try {
        console.log('Received request body:', req.body);
        const { referrerId, userId, userData } = req.body;

        // Проверяем обязательные поля
        if (!referrerId || !userId || !userData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Подключаемся к MongoDB
        const client = await MongoClient.connect(uri);
        console.log('Connected to MongoDB');

        const db = client.db('game-db');
        const referrals = db.collection('referrals');

        // Проверяем, не является ли пользователь уже чьим-то рефералом
        const existingReferral = await referrals.findOne({ userId });
        if (existingReferral) {
            await client.close();
            return res.status(400).json({
                success: false,
                message: 'User already has a referrer'
            });
        }

        // Сохраняем нового реферала
        const result = await referrals.insertOne({
            referrerId,
            userId,
            userData,
            joinedAt: new Date(),
            rewardClaimed: false
        });

        await client.close();
        console.log('Referral saved:', result);

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}