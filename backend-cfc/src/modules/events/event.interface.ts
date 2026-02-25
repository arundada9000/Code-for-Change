import { Document } from "mongoose";

export enum EventType {
  HACKATHON = "hackathon",
  WORKSHOP = "workshop",
  WEBINAR = "webinar",
  CONFERENCE = "conference",
  SOCIAL_IMPACT = "social_impact",
}

export interface ISpeaker {
  name: string;
  role: string;
  organization?: string;
  image?: string;
  linkedin?: string;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  fullDescription?: string;
  slug?: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  location: string;
  province?: string;
  venue?: string;
  image: string;
  registrationLink?: string;
  registrationDeadline?: Date;
  type: string;
  status?: "Draft" | "Published" | "Upcoming" | "Live" | "Completed";
  organizer: string;
  tags?: string[];
  speakers?: ISpeaker[];
  highlights?: string[];
  benefits?: string[];
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
