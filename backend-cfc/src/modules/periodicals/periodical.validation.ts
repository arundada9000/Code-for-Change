import { z } from "zod";

export const createPeriodicalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required"),
    province: z.string().trim().optional(),
    category: z.string().trim().optional(),
    tags: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
    isPublished: z
      .union([z.string(), z.boolean()])
      .transform((val) => val === "true" || val === true)
      .optional(),
  }),
});

export const updatePeriodicalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).optional(),
    province: z.string().trim().optional(),
    category: z.string().trim().optional(),
    tags: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
    isPublished: z
      .union([z.string(), z.boolean()])
      .transform((val) => val === "true" || val === true)
      .optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
