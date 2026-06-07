import { z } from "zod";

export const createResourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(['academic', 'branding', 'background', 'internal', 'other']).optional(),
  visibility: z.enum(['public', 'gm', 'cr', 'eb', 'admin']).optional(),
  type: z.enum(['file', 'image', 'link', 'color-code', 'notes', 'assignment', 'lab', 'project']).optional(),
  colorHex: z.string().optional(),
  externalLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  subject: z.string().optional(),
  semester: z.string().optional(),
  tags: z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string()).optional()),
  isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
});

export const updateResourceSchema = createResourceSchema.partial();
