import { splitSections, parseKeyValues } from './parse-utils';
import { educationEntrySchema } from '@/schemas';
import type { EducationEntry } from '@/types';

export function parseEducation(raw: string): EducationEntry[] {
  const sections = splitSections(raw);
  return sections.map((section) => {
    const [institution, rest] = section.heading.split(' — ');
    const spaceIdx = (rest ?? '').indexOf(' ');
    const degree =
      spaceIdx === -1 ? (rest ?? '') : (rest ?? '').slice(0, spaceIdx);
    const field = spaceIdx === -1 ? '' : (rest ?? '').slice(spaceIdx + 1);

    const kv = parseKeyValues(section.content);
    const honors = kv['honors']
      ? kv['honors']
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    return educationEntrySchema.parse({
      institution,
      degree,
      field,
      start: kv['start'],
      end: kv['end'],
      gpa: kv['gpa'],
      honors,
    });
  });
}
