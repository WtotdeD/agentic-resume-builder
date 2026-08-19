import yaml from 'js-yaml';
import { resumeConfigSchema } from '@/schemas';
import type { ResumeConfig } from '@/types';

export function parseResumeConfig(raw: string): ResumeConfig {
  const data = yaml.load(raw);
  return resumeConfigSchema.parse(data);
}
