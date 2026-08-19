import yaml from 'js-yaml';
import { settingsSchema } from '@/schemas';
import type { Settings } from '@/types';

export function parseSettings(raw: string): Settings {
  const data = yaml.load(raw);
  return settingsSchema.parse(data);
}
