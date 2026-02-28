import { z } from "zod";

const arrayPreprocess = (val: any) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val ? [val] : [];
    }
  }
  return val;
};

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required"),
    fullDescription: z.string().trim().optional().or(z.literal("")),
    date: z.string().trim().or(z.date()),
    startDate: z.string().trim().optional().or(z.literal("")),
    endDate: z.string().trim().optional().or(z.literal("")),
    location: z.string().trim().min(1, "Location is required"),
    venue: z.string().trim().optional().or(z.literal("")),
    registrationLink: z.string().url().optional().or(z.literal("")),
    registrationDeadline: z.string().optional().or(z.literal("")),
    type: z.enum(["hackathon", "workshop", "webinar", "conference", "social_impact"]),
    status: z.enum(["Draft", "Published", "Upcoming", "Live", "Completed"]).optional(),
    organizer: z.string().trim().min(1, "Organizer is required"),
    province: z.string().trim().optional().or(z.literal("")),
    speakers: z.preprocess(arrayPreprocess, z.array(z.any())).optional(),
    highlights: z.preprocess(arrayPreprocess, z.array(z.string())).optional(),
    benefits: z.preprocess(arrayPreprocess, z.array(z.string())).optional(),
    isCompleted: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
  }).passthrough(),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).optional(),
    fullDescription: z.string().trim().optional().or(z.literal("")),
    date: z.string().trim().or(z.date()).optional(),
    startDate: z.string().trim().optional().or(z.literal("")),
    endDate: z.string().trim().optional().or(z.literal("")),
    location: z.string().trim().min(1).optional(),
    venue: z.string().trim().optional().or(z.literal("")),
    registrationLink: z.string().url().optional().or(z.literal("")),
    registrationDeadline: z.string().optional().or(z.literal("")),
    type: z.enum(["hackathon", "workshop", "webinar", "conference", "social_impact"]).optional(),
    status: z.enum(["Draft", "Published", "Upcoming", "Live", "Completed"]).optional(),
    organizer: z.string().trim().min(1).optional(),
    province: z.string().trim().optional().or(z.literal("")),
    speakers: z.preprocess(arrayPreprocess, z.array(z.any())).optional(),
    highlights: z.preprocess(arrayPreprocess, z.array(z.string())).optional(),
    benefits: z.preprocess(arrayPreprocess, z.array(z.string())).optional(),
    isCompleted: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
  }).passthrough(),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

