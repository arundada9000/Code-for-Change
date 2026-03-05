import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || process.env.DB_URI?.replace('localhost', '127.0.0.1') || 'mongodb://127.0.0.1:27017/cfc';

async function main() {
    await mongoose.connect(uri);
    try {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('No DB connection!');
        }
        const result = await db.collection('users').updateMany(
            { role: { $in: ['eb', 'cr', 'gm'] } },
            { $set: { province: 'Kathmandu' } }
        );
        console.log(`Updated ${result.modifiedCount} users to have Kathmandu province.`);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(console.error);
