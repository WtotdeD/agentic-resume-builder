import { z } from 'zod';
import {
  yearMonth,
  educationEntrySchema,
  skillCategorySchema,
  projectEntrySchema,
  showcaseEntrySchema,
  certificationEntrySchema,
} from './content.schema';
import { sectionName } from './resume-config.schema';

const assembledExperienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  start: yearMonth,
  end: yearMonth.optional(),
  technologies: z.array(z.string()).optional(),
  narrative: z.string().optional(),
  sections: z.record(z.string(), z.array(z.string())).optional(),
  showcases: z.array(showcaseEntrySchema).optional(),
  expanded: z.boolean(),
});

export const assembledResumeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
  photo: z.string().min(1).optional(),

  title: z.string().min(1),
  tagline: z.string().optional(),
  summary: z.string().min(1),

  experience: z.array(assembledExperienceSchema),
  education: z.array(educationEntrySchema),
  skills: z.array(skillCategorySchema).optional(),
  showcases: z.array(showcaseEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),

  style: z
    .object({
      accent: z.string().optional(),
    })
    .optional(),

  sectionOrder: z.array(sectionName).optional(),
});
