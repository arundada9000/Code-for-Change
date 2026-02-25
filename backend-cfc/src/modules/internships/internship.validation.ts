import { z } from "zod";
import { InternshipType, InternshipStatus } from "./internship.interface.js";

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

export const createInternshipSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    companyName: z.string().trim().min(1, "Company name is required"),
    companyLogo: z.string().trim().optional(),
    location: z.string().trim().min(1, "Location is required"),
    type: z.nativeEnum(InternshipType),
    category: z.string().trim().min(1, "Category is required"),
    description: z.string().trim().min(1, "Description is required"),
    requirements: z.preprocess(arrayPreprocess, z.array(z.string()).optional()),
    responsibilities: z.preprocess(arrayPreprocess, z.array(z.string()).optional()),
    salaryRange: z.string().trim().optional(),
    applicationDeadline: z.string().or(z.date()).optional(),
    applyLink: z.string().trim().url("Invalid apply link URL"),
    status: z.nativeEnum(InternshipStatus).optional(),
    postedBy: z.string().trim().min(1, "Posted by is required"),
  }),
});

export const updateInternshipSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    companyName: z.string().trim().min(1).optional(),
    companyLogo: z.string().trim().optional(),
    location: z.string().trim().min(1).optional(),
    type: z.nativeEnum(InternshipType).optional(),
    category: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    requirements: z.preprocess(arrayPreprocess, z.array(z.string()).optional()),
    responsibilities: z.preprocess(arrayPreprocess, z.array(z.string()).optional()),
    salaryRange: z.string().trim().optional(),
    applicationDeadline: z.string().or(z.date()).optional(),
    applyLink: z.string().trim().url().optional(),
    status: z.nativeEnum(InternshipStatus).optional(),
    postedBy: z.string().trim().min(1).optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
