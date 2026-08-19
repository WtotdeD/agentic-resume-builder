import fs from 'node:fs';
import path from 'node:path';
import { parseResumeConfig } from './parse-config';
import type { ResumeConfig } from '@/types';

export type ResumeConfigEntry = {
  name: string;
  config: ResumeConfig;
};

export function listResumeConfigs(resumesDir: string): ResumeConfigEntry[] {
  if (!fs.existsSync(resumesDir)) return [];

  const entries: ResumeConfigEntry[] = [];

  for (const file of fs
    .readdirSync(resumesDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()) {
    try {
      const raw = fs.readFileSync(path.join(resumesDir, file), 'utf-8');
      const name = path.basename(file, path.extname(file));
      entries.push({ name, config: parseResumeConfig(raw) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[config] Skipping ${file}: ${msg}`);
    }
  }

  return entries;
}
