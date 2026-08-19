import { splitSections } from './parse-utils';
import { skillCategorySchema } from '@/schemas';
import type { SkillCategory } from '@/types';

export function parseSkills(raw: string): SkillCategory[] {
  const sections = splitSections(raw);
  return sections.map((section) => {
    const skills = section.content
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith('#');
      })
      .flatMap((line) =>
        line
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );

    return skillCategorySchema.parse({
      category: section.heading,
      skills,
    });
  });
}
