import {
  splitSections,
  splitSubsections,
  parseKeyValues,
  parseBullets,
} from './parse-utils';
import { showcaseEntrySchema } from '@/schemas';
import type { ShowcaseEntry } from '@/types';

export function parseShowcases(raw: string): ShowcaseEntry[] {
  const sections = splitSections(raw);
  return sections.map((section) => {
    const kv = parseKeyValues(section.content);

    const technologies = kv['technologies']
      ? kv['technologies']
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const related_experience = kv['related_experience']
      ? kv['related_experience']
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const kvKeys = new Set(Object.keys(kv));
    const summaryLines = section.content.split('\n').filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-'))
        return false;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const key = trimmed.slice(0, colonIdx).trim();
        if (kvKeys.has(key)) return false;
      }
      return true;
    });
    const summary = summaryLines.join('\n').trim();

    const subsections = splitSubsections(section.content);
    const highlightsSection = subsections.find(
      (s) => s.heading === 'Highlights',
    );
    const highlights = highlightsSection
      ? parseBullets(highlightsSection.content)
      : [];

    return showcaseEntrySchema.parse({
      id: kv['id'],
      name: section.heading,
      repo: kv['repo'],
      technologies,
      related_experience,
      summary,
      highlights,
    });
  });
}
