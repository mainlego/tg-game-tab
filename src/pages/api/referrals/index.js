// pages/api/referrals/index.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
    // Добавляем CORS заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    let mongoClient;

    try {
        const { referrerId, userId, userData } = req.body;

        if (!referrerId || !userId || !userData) {
            throw new Error('Required fields are missing');
        }

        mongoClient = await MongoClient.connect(uri);
        const db = mongoClient.db('game-db');
        const referrals = db.collection('referrals');

        // Проверяем, не является ли пользователь уже чьим-то рефералом
        const existingReferral = await referrals.findOne({ userId });
        if (existingReferral) {
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

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
}