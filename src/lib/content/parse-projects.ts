import { splitSections, parseKeyValues } from './parse-utils';
import { projectEntrySchema } from '@/schemas';
import type { ProjectEntry } from '@/types';

export function parseProjects(raw: string): ProjectEntry[] {
  const sections = splitSections(raw);
  return sections.map((section) => {
    const kv = parseKeyValues(section.content);

    const technologies = kv['technologies']
      ? kv['technologies']
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const highlights = kv['highlights']
      ? kv['highlights']
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    return projectEntrySchema.parse({
      name: section.heading,
      description: kv['description'],
      url: kv['url'],
      technologies,
      highlights,
    });
  });
}
