import { z } from "zod";

export const createImpactSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    dates: z.string().min(1, "Dates are required"),
    tenure: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    province: z.string().optional().or(z.literal("")),
    platform: z.string().optional().or(z.literal("")),
    details: z.string().optional().or(z.literal("")),
    isLarge: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
    imagePreview: z.string().optional().or(z.literal("")),
  }).passthrough(),
});

export const updateImpactSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    dates: z.string().min(1).optional(),
    tenure: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    province: z.string().optional().or(z.literal("")),
    platform: z.string().optional().or(z.literal("")),
    details: z.string().optional().or(z.literal("")),
    isLarge: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
    imagePreview: z.string().optional().or(z.literal("")),
  }).passthrough(),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

