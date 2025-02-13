// pages/api/referrals/index.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log('Received request:', {
        method: req.method,
        body: req.body
    });

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        const { referrerId, userId, userData } = req.body;

        if (!referrerId || !userId || !userData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Подключение к MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('game-db');
        const collection = db.collection('referrals');

        // Проверяем, существует ли уже такой реферал
        const existing = await collection.findOne({ userId });
        if (existing) {
            await client.close();
            return res.status(400).json({
                success: false,
                message: 'User already has a referrer'
            });
        }

        // Сохраняем нового реферала
        const result = await collection.insertOne({
            referrerId,
            userId,
            userData,
            createdAt: new Date(),
            rewardClaimed: false
        });

        await client.close();

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