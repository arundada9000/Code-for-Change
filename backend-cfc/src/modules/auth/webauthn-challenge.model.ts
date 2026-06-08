import mongoose, { Schema, Document } from "mongoose";

export interface IWebAuthnChallenge extends Document {
  challengeId: string;
  challenge: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WebAuthnChallengeSchema: Schema = new Schema(
  {
    challengeId: { type: String, required: true, unique: true },
    challenge: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now, expires: 60 } // Automatically deleted after 60 seconds
  }
);

export const WebAuthnChallenge = mongoose.model<IWebAuthnChallenge>(
  "WebAuthnChallenge",
  WebAuthnChallengeSchema
);
