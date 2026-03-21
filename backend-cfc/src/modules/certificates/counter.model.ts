import mongoose, { Schema, Document } from "mongoose";

/**
 * Counter Model
 * Tracks the latest certificate sequence number per province per year.
 * Key format: "<Province>-<Year>" (e.g. "Rupandehi-2026")
 * This guarantees automatic yearly resets and zero ID collisions via atomic $inc.
 */
export interface ICounter extends Document {
  counterId: string;  // e.g. "Rupandehi-2026"
  seq: number;        // last issued 4-digit sequence number
}

const CounterSchema: Schema = new Schema({
  counterId: { type: String, required: true, unique: true, index: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);
