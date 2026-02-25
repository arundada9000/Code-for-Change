import mongoose, { Schema, Document } from "mongoose";

export interface IAdminTask extends Document {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  relatedResource?: string; // e.g., 'EVENT', 'BLOG'
  relatedResourceId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminTaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    relatedResource: { type: String },
    relatedResourceId: { type: Schema.Types.ObjectId },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const AdminTask = mongoose.model<IAdminTask>("AdminTask", AdminTaskSchema);
