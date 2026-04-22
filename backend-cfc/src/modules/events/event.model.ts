import { Schema, model } from "mongoose";
import { IEvent, EventType } from "./event.interface.js";

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String, // Short description
      required: [true, "Event description is required"],
      trim: true,
    },
    fullDescription: {
      type: String, // Detailed description for single page
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    date: {
      type: Date, // Display date (single day or start day)
      required: [true, "Event date is required"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Event image is required"],
    },
    registrationLink: {
      type: String,
      trim: true,
    },
    registrationDeadline: {
      type: Date,
    },
    type: {
      type: String,
      enum: Object.values(EventType),
      default: EventType.WORKSHOP, // Default fall back
      required: [true, "Event type is required"],
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Upcoming", "Live", "Completed"],
      default: "Draft",
    },
    organizer: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    speakers: {
      type: [{
        name: { type: String, required: true },
        role: { type: String, required: true },
        organization: { type: String },
        image: { type: String },
        linkedin: { type: String },
      }],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isNational: {
      type: Boolean,
      default: false,
    },
    contactInfo: {
      type: [{
        type: { type: String, enum: ['email', 'phone', 'other'], required: true },
        value: { type: String, required: true, trim: true },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
// Pre-save hook to generate slug
eventSchema.pre("save", async function () {
  if (!this.isModified("title") && !this.isNew) {
    return;
  }

  if (!this.slug) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Check for uniqueness
    const existingEvent = await model("Event").findOne({ slug });
    if (existingEvent) {
      slug = `${slug}-${Date.now()}`; // Append timestamp for uniqueness
    }
    
    this.slug = slug;
  }
});

export const Event = model<IEvent>("Event", eventSchema);
