// src/pages/api/referrals/index.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    // Добавляем более подробное логирование
    console.log('API Request received:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
    });

    // CORS заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} not allowed`
        });
    }

    try {
        const { referrerId, userId, userData } = req.body;
        console.log('Processing referral data:', { referrerId, userId, userData });

        if (!referrerId || !userId || !userData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        const db = client.db('game-db');
        const collection = db.collection('referrals');

        const existing = await collection.findOne({ userId });
        if (existing) {
            await client.close();
            return res.status(400).json({
                success: false,
                message: 'User already has a referrer'
            });
        }

        const result = await collection.insertOne({
            referrerId,
            userId,
            userData,
            createdAt: new Date(),
            rewardClaimed: false
        });

        await client.close();
        console.log('Referral saved successfully:', result);

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}