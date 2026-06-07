import { z } from "zod";

export const createTestimonialSchema = z.object({
  text: z.string().min(1, "Text is required").max(1000, "Text cannot exceed 1000 characters"),
  author: z.string().min(1, "Author name is required").max(100, "Author name cannot exceed 100 characters"),
  role: z.string().min(1, "Author role is required").max(100, "Role cannot exceed 100 characters"),
  isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  order: z.preprocess((val) => Number(val), z.number().optional()),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();
