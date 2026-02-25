import { z } from "zod";

export const createGallerySchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    category: z.string().min(1, "Category is required"),
    isFeatured: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
  }),
});

export const updateGallerySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    category: z.string().min(1).optional(),
    isFeatured: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
