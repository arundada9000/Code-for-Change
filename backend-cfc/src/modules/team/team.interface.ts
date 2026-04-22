import { Document } from "mongoose";

export interface ISocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface INationalTeamMember extends Document {
  name: string;
  designation: string;
  type: string;
  image?: string;
  socialLinks?: ISocialLinks;
  createdAt: Date;
  updatedAt: Date;
}
