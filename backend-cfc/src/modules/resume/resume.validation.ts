import { z } from "zod";

const personalInfoSchema = z.object({
  fullName: z.string().max(200).optional().default(""),
  title: z.string().max(200).optional().default(""),
  email: z.string().max(200).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  address: z.string().max(300).optional().default(""),
  summary: z.string().max(2000).optional().default(""),
  website: z.string().max(500).optional().default(""),
  linkedin: z.string().max(500).optional().default(""),
  github: z.string().max(500).optional().default(""),
  profileImage: z.string().max(500).optional().default(""),
});

const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().max(200).optional().default(""),
  position: z.string().max(200).optional().default(""),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  current: z.boolean().optional().default(false),
  description: z.string().max(3000).optional().default(""),
});

const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().max(200).optional().default(""),
  degree: z.string().max(200).optional().default(""),
  field: z.string().max(200).optional().default(""),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  gpa: z.string().max(20).optional().default(""),
  description: z.string().max(2000).optional().default(""),
});

const skillGroupSchema = z.object({
  id: z.string().optional(),
  category: z.string().max(100).optional().default(""),
  items: z.array(z.string().max(100)).optional().default([]),
});

const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(200).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  technologies: z.string().max(500).optional().default(""),
  link: z.string().max(500).optional().default(""),
});

const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(200).optional().default(""),
  issuer: z.string().max(200).optional().default(""),
  date: z.string().max(20).optional().default(""),
  link: z.string().max(500).optional().default(""),
});

const languageSchema = z.object({
  id: z.string().optional(),
  language: z.string().max(100).optional().default(""),
  proficiency: z.string().max(50).optional().default("Intermediate"),
});

const linkSchema = z.object({
  id: z.string().optional(),
  label: z.string().max(100).optional().default(""),
  url: z.string().max(500).optional().default(""),
});

export const createResumeSchema = z.object({
  title: z.string().max(200).optional().default("Untitled Resume"),
  templateId: z.string().max(50).optional().default("minimalist-pro"),
  accentColor: z.string().max(20).optional().default("#0076B4"),
  personalInfo: personalInfoSchema.optional(),
  experience: z.array(experienceSchema).max(20).optional().default([]),
  education: z.array(educationSchema).max(10).optional().default([]),
  skills: z.array(skillGroupSchema).max(15).optional().default([]),
  projects: z.array(projectSchema).max(20).optional().default([]),
  certifications: z.array(certificationSchema).max(20).optional().default([]),
  languages: z.array(languageSchema).max(20).optional().default([]),
  links: z.array(linkSchema).max(20).optional().default([]),
});

export const updateResumeSchema = createResumeSchema;
