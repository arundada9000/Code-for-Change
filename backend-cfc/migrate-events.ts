/**
 * Migration: set isNational=false and rename province->region on all events
 * Run with: npx tsx --env-file=.env migrate-events.ts
 */
import mongoose from 'mongoose';
import { ENV } from './src/shared/configs/env'; // Assuming env gets loaded, or we just rely on process.env 

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error('MONGO_URI not set.');

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB via mongoose');
    
    // Drop down to native driver
    const db = mongoose.connection.db;
    if (!db) throw new Error('db undefined');
    
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
    await mongoose.disconnect();
  }
}

migrate().catch(console.error);
