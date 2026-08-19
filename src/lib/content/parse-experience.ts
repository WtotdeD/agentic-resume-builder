import yaml from 'js-yaml';
import { splitFrontmatter, splitSections, parseBullets } from './parse-utils';
import { experienceEntrySchema } from '@/schemas';
import type { ExperienceEntry } from '@/types';

export function parseExperience(
  raw: string,
  filename: string,
): ExperienceEntry | null {
  const { frontmatter, body } = splitFrontmatter(raw);
  const meta = yaml.load(frontmatter) as Record<string, unknown>;

  if (meta['draft'] === true) return null;

  const firstHeadingIdx = body.search(/^## /m);
  const narrativeRaw =
    firstHeadingIdx === -1 ? body : body.slice(0, firstHeadingIdx);
  const narrative = narrativeRaw
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .join('\n')
    .trim();

  const sectionList = splitSections(body);
  const sections: Record<string, string[]> = {};
  for (const section of sectionList) {
    sections[section.heading] = parseBullets(section.content);
  }

  try {
    return experienceEntrySchema.parse({
      ...meta,
      narrative,
      sections,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`${filename}: ${err.message}`);
    }
    throw err;
  }
}
