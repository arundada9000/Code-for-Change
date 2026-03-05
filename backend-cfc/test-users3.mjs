import { MongoClient } from 'mongodb';
const uri = 'mongodb://localhost:27017/cfc';

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('cfc');
        const result = await db.collection('users').updateMany(
            { role: { $in: ['eb', 'cr', 'gm'] } },
            { $set: { province: 'Kathmandu' } }
        );
        console.log(`Updated ${result.modifiedCount} users to have Kathmandu province.`);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
