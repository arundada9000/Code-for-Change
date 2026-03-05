import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || process.env.DB_URI?.replace('localhost', '127.0.0.1') || 'mongodb://127.0.0.1:27017/cfc';

async function main() {
    await mongoose.connect(uri);
    try {
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ role: { $in: ['eb', 'cr', 'gm'] } }).toArray();
        console.log(`Found ${users.length} users.`);
        for (const u of users) {
            console.log(`- ${u.name}: ${u.province} (${u.role})`);
        }
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(console.error);
