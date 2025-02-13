// pages/api/referrals/[userId].js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    // Добавляем CORS заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Обработка OPTIONS запроса для CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    console.log('Get referrals request:', {
        method: req.method,
        query: req.query,
        headers: req.headers
    });

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    let mongoClient;

    try {
        console.log('MongoDB URI exists:', !!uri);
        if (!uri) {
            throw new Error('MongoDB URI is not configured');
        }

        mongoClient = await MongoClient.connect(uri);
        console.log("MongoDB connected successfully");

        const db = mongoClient.db('game-db');
        const referrals = db.collection('referrals');

        const { userId } = req.query;
        if (!userId) {
            throw new Error('User ID is required');
        }

        console.log('Fetching referrals for user:', userId);

        const userReferrals = await referrals
            .find({ referrerId: userId })
            .toArray();

        console.log('Found referrals:', userReferrals);

        return res.status(200).json({
            success: true,
            data: userReferrals
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
            console.log("MongoDB connection closed");
        }
    }
}