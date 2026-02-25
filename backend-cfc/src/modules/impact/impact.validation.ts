import { z } from "zod";

export const createImpactSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    dates: z.string().min(1, "Dates are required"),
    tenure: z.string().optional(),
    location: z.string().optional(),
    platform: z.string().optional(),
    details: z.string().optional(),
    isLarge: z.boolean().optional(),
    metrics: z.object({
      participants: z.number().optional(),
      projects: z.number().optional(),
      impact: z.string().optional(),
    }).optional(),
  }),
});

export const updateImpactSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    dates: z.string().min(1).optional(),
    tenure: z.string().optional(),
    location: z.string().optional(),
    platform: z.string().optional(),
    details: z.string().optional(),
    isLarge: z.boolean().optional(),
    metrics: z.object({
      participants: z.number().optional(),
      projects: z.number().optional(),
      impact: z.string().optional(),
    }).optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
