import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || process.env.DB_URI?.replace('localhost', '127.0.0.1') || 'mongodb://127.0.0.1:27017/cfc';

const VALID_POSITIONS = [
    "tech-lead", "project-lead", "vice-project-lead", "operation-lead",
    "admin-lead", "hr-lead", "pr-lead", "treasurer", "vice-treasurer",
    "executive-member", "secretary", "vice-secretary"
];

async function main() {
    await mongoose.connect(uri);
    try {
        const db = mongoose.connection.db;
        if (!db) throw new Error('No DB connection!');

        // Find users with an invalid executiveDetails.position
        const users = await db.collection('users').find({}).toArray();
        let updatedCount = 0;

        for (const user of users) {
            if (user.executiveDetails && user.executiveDetails.position) {
                if (!VALID_POSITIONS.includes(user.executiveDetails.position)) {
                    console.log(`Fixing user ${user.email} - Invalid position: ${user.executiveDetails.position}`);
                    await db.collection('users').updateOne(
                        { _id: user._id },
                        { $unset: { "executiveDetails.position": "" } }
                    );
                    updatedCount++;
                }
            }
        }
        console.log(`Successfully fixed ${updatedCount} users with invalid positions.`);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(console.error);
