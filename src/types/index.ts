import { z } from 'zod';
import {
  experienceEntrySchema,
  educationEntrySchema,
  skillCategorySchema,
  projectEntrySchema,
  showcaseEntrySchema,
  certificationEntrySchema,
  settingsSchema,
  resumeConfigSchema,
  assembledResumeSchema,
} from '@/schemas';

export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type ShowcaseEntry = z.infer<typeof showcaseEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type ResumeConfig = z.infer<typeof resumeConfigSchema>;
export type AssembledResume = z.infer<typeof assembledResumeSchema>;
