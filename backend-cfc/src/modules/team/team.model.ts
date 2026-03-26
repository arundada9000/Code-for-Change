import mongoose, { Schema } from "mongoose";
import { INationalTeamMember } from "./team.interface.js";

const socialLinksSchema = new Schema(
  {
    linkedin: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    github: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { _id: false }
);

const nationalTeamMemberSchema = new Schema<INationalTeamMember>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Core Team", "Board Member", "Advisor"],
      required: [true, "Team member type is required"],
    },
    image: {
      type: String,
      default: "",
    },
    socialLinks: {
      type: socialLinksSchema,
      default: {},
    },
  },
  { timestamps: true }
);

export const NationalTeamMember = mongoose.model<INationalTeamMember>(
  "NationalTeamMember",
  nationalTeamMemberSchema
);
