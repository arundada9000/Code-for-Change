import { Schema, model } from "mongoose";
import { IResource } from "./resource.interface";

const resourceSchema = new Schema < IResource > (
    {
        title: {
            type: String,
            required: [true, "Resource title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        semester: {
            type: String,
            required: [true, "Semester is required"],
            trim: true,
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: ['notes', 'assignment', 'lab', 'project', 'other'],
            required: [true, "Resource type is required"],
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        file: {
            type: String,
        },
        uploadedBy: {
            type: String,
            default: "Admin",
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        downloads: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Resource = model < IResource > ("Resource", resourceSchema);
