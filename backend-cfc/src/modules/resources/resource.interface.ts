import { Document } from "mongoose";

export type ResourceVisibility = 'public' | 'gm' | 'cr' | 'eb' | 'admin';
export type ResourceCategory = 'academic' | 'branding' | 'background' | 'internal' | 'other';
export type ResourceType = 'file' | 'image' | 'link' | 'color-code' | 'notes' | 'assignment' | 'lab' | 'project';

export interface IResource extends Document {
  title: string;
  description: string;
  category: ResourceCategory;
  visibility: ResourceVisibility;
  type: ResourceType;

  // Content fields (at least one required)
  fileUrl?: string;    // Cloudinary URL or external link
  colorHex?: string;   // For color-code type, e.g. "#FF5733"
  externalLink?: string; // For link type

  // Metadata
  subject?: string;    // Province name for backgrounds, subject name for academic, etc.
  semester?: string;   // For academic resources
  tags?: string[];

  uploadedBy?: string;
  isActive: boolean;
  downloads?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
