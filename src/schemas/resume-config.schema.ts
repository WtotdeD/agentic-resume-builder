import { z } from 'zod';

const sectionFilter = z.union([z.literal('all'), z.array(z.string())]);

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color (#RRGGBB)');

export const sectionName = z.enum([
  'summary',
  'experience',
  'showcases',
  'skills',
  'education',
  'certifications',
  'projects',
]);

export const resumeConfigSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().optional(),
  summary: z.string().min(1),
  experience: z.object({
    expand: z.array(z.string()),
    sections: z.array(z.string()).optional(),
    maxAchievements: z.number().int().positive().optional(),
    maxTechnologies: z.number().int().positive().optional(),
    narrative: z.enum(['full', 'short', 'none']).optional(),
  }),
  skills: sectionFilter.optional(),
  showcases: z.array(z.string()).optional(),
  certifications: sectionFilter.optional(),
  projects: sectionFilter.optional(),
  style: z
    .object({
      accent: hexColor.optional(),
    })
    .optional(),
  sectionOrder: z.array(sectionName).optional(),
});
