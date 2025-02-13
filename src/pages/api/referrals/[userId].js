import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await client.connect();
        const db = client.db('game-db');
        const referrals = db.collection('referrals');

        const { userId } = req.query;

        const userReferrals = await referrals
            .find({ referrerId: userId })
            .toArray();

        res.status(200).json(userReferrals);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error getting referrals' });
    } finally {
        await client.close();
    }
}