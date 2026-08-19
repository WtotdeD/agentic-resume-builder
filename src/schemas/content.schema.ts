import { z } from 'zod';

export const yearMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM format');

export const experienceEntrySchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  start: yearMonth,
  end: yearMonth.optional(),
  draft: z.boolean().default(false),
  technologies: z.array(z.string()).optional(),
  narrative: z.string(),
  sections: z.record(z.string(), z.array(z.string())).default({}),
});

export const educationEntrySchema = z.object({
  institution: z.string().min(1),
  degree: z.string(),
  field: z.string(),
  start: yearMonth,
  end: yearMonth.optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
});

export const skillCategorySchema = z.object({
  category: z.string().min(1),
  skills: z.array(z.string()).min(1),
});

export const projectEntrySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional(),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

export const showcaseEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  repo: z.string().url(),
  technologies: z.array(z.string()).optional(),
  related_experience: z.array(z.string()).optional(),
  summary: z.string().min(1),
  highlights: z.array(z.string()),
});

export const certificationEntrySchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  obtained: yearMonth,
  expires: yearMonth.optional(),
  url: z.string().url().optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
  photo: z.string().min(1).optional(),
});
