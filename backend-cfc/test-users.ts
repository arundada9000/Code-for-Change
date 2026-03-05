import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/cfc').then(async () => {
    const db = mongoose.connection.db;
    await db.collection('users').updateMany({ role: { $in: ['eb', 'cr', 'gm'] } }, { $set: { province: 'Kathmandu' } });
    console.log('Updated DB users with Kathmandu province for testing!');
    process.exit(0);
});
