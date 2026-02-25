import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required"),
    date: z.string().trim().or(z.date()),
    location: z.string().trim().min(1, "Location is required"),
    registrationLink: z.string().url().optional(),
    type: z.enum(["hackathon", "workshop", "webinar", "conference", "social_impact"]),
    organizer: z.string().trim().min(1, "Organizer is required"),
    isCompleted: z.boolean().optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).optional(),
    date: z.string().trim().or(z.date()).optional(),
    location: z.string().trim().min(1).optional(),
    registrationLink: z.string().url().optional(),
    type: z.enum(["hackathon", "workshop", "webinar", "conference", "social_impact"]).optional(),
    organizer: z.string().trim().min(1).optional(),
    isCompleted: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
