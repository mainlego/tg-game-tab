// pages/api/referrals/[userId].js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    log('Get referrals request:', {
        method: req.method,
        query: req.query
    });

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        log('MongoDB URI exists:', !!uri);

        await client.connect();
        await client.db("admin").command({ ping: 1 });
        log("MongoDB connected successfully");

        const db = client.db('game-db');
        const referrals = db.collection('referrals');

        const { userId } = req.query;
        log('Fetching referrals for user:', userId);

        const userReferrals = await referrals
            .find({ referrerId: userId })
            .toArray();

        log('Found referrals:', userReferrals);
        res.status(200).json(userReferrals);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
}