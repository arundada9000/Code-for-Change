/**
 * Migration script: set isNational=false on all existing events
 * and rename 'province' field to 'region' on all existing documents.
 * Run with: node migrate-events.js
 */
require('dotenv/config');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();
    const col = db.collection('events');

    // 1. Set isNational = false for all events that don't have it
    const nationalResult = await col.updateMany(
      { isNational: { $exists: false } },
      { $set: { isNational: false } }
    );
    console.log(`isNational: set on ${nationalResult.modifiedCount} events`);

    // 2. Rename 'province' field to 'region' on all events that have 'province'
    const renameResult = await col.updateMany(
      { province: { $exists: true } },
      { $rename: { province: 'region' } }
    );
    console.log(`province→region: renamed on ${renameResult.modifiedCount} events`);

    console.log('Migration complete!');
  } finally {
    await client.close();
  }
}

migrate().catch(console.error);
