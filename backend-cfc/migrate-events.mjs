/**
 * Migration: set isNational=false and rename province->region on all events
 * Run with: node --env-file=.env migrate-events.mjs
 */
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI not set. Run with: node --env-file=.env migrate-events.mjs');

const client = new MongoClient(MONGO_URI);
try {
  await client.connect();
  console.log('Connected to MongoDB');
  const db = client.db();
  const col = db.collection('events');

  const r1 = await col.updateMany(
    { isNational: { $exists: false } },
    { $set: { isNational: false } }
  );
  console.log(`isNational set on ${r1.modifiedCount} events`);

  const r2 = await col.updateMany(
    { province: { $exists: true } },
    { $rename: { province: 'region' } }
  );
  console.log(`province->region renamed on ${r2.modifiedCount} events`);

  console.log('Migration complete!');
} finally {
  await client.close();
}
