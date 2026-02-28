import { z } from "zod";

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    content: z.string().trim().min(1, "Content is required"),
    excerpt: z.string().trim().min(1, "Excerpt is required").max(300),
    author: z.string().trim().min(1, "Author name is required"),
    category: z.string().trim().min(1, "Category is required"),
    tags: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
    readTime: z.string().trim().optional(),
    isPublished: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true),
    highlights: z.union([z.string(), z.array(z.string())]).optional(),
    authorDetails: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        }
        return val;
      },
      z.object({
        name: z.string().trim().min(1, "Author name is required"),
        role: z.string().trim().min(1, "Author role is required"),
        linkedin: z.string().trim().optional().or(z.literal("")),
        facebook: z.string().trim().optional().or(z.literal("")),
        tiktok: z.string().trim().optional().or(z.literal("")),
        instagram: z.string().trim().optional().or(z.literal("")),
        youtube: z.string().trim().optional().or(z.literal("")),
      })
    ).optional(),
    isFeatured: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(200).optional(),
    metaKeywords: z.string().optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).optional(),
    excerpt: z.string().trim().min(1).max(300).optional(),
    author: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    tags: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
    readTime: z.string().trim().optional(),
    isPublished: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
    highlights: z.union([z.string(), z.array(z.string())]).optional(),
    authorDetails: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        }
        return val;
      },
      z.object({
        name: z.string().trim().min(1).optional(),
        role: z.string().trim().min(1).optional(),
        linkedin: z.string().trim().optional().or(z.literal("")),
        facebook: z.string().trim().optional().or(z.literal("")),
        tiktok: z.string().trim().optional().or(z.literal("")),
        instagram: z.string().trim().optional().or(z.literal("")),
        youtube: z.string().trim().optional().or(z.literal("")),
      })
    ).optional(),
    isFeatured: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(200).optional(),
    metaKeywords: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
