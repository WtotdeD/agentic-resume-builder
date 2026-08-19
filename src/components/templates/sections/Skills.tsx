import type { SkillCategory } from '@/types';
import { SectionHeading } from './SectionHeading';

type SkillsProps = {
  categories: SkillCategory[];
  heading: string;
};

export function Skills({ categories, heading }: SkillsProps) {
  if (categories.length === 0) return null;

  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="resume-section mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <div key={cat.category} className="text-sm">
            <span className="font-medium text-slate-800">{cat.category}: </span>
            <span className="text-slate-600">{cat.skills.join(', ')}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
