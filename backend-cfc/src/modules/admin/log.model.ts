import mongoose, { Schema, Document } from "mongoose";

export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const LogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    resource: { type: String, required: true }, // 'EVENT', 'BLOG', 'USER', etc.
    resourceId: { type: String },
    details: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for faster queries on recent activities
LogSchema.index({ createdAt: -1 });

export const Log = mongoose.model<ILog>("Log", LogSchema);
