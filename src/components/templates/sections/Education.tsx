import type { AssembledResume } from '@/types';
import { formatSingleDate } from '@/lib/formatting/dates';
import { SectionHeading } from './SectionHeading';

type EducationProps = {
  entries: AssembledResume['education'];
  heading: string;
  locale?: 'en' | 'nl';
};

export function Education({ entries, heading, locale = 'en' }: EducationProps) {
  if (entries.length === 0) return null;

  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="resume-section mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={`${entry.institution}-${entry.field}`} className="text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800">
                  {entry.institution}
                </span>
                <span className="text-slate-600">
                  {' — '}
                  {entry.degree} {entry.field}
                </span>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {formatSingleDate(entry.start, locale)}
                {entry.end && ` – ${formatSingleDate(entry.end, locale)}`}
              </span>
            </div>
            {entry.gpa && (
              <p className="text-xs text-slate-500">GPA: {entry.gpa}</p>
            )}
            {entry.honors && entry.honors.length > 0 && (
              <p className="text-xs text-slate-500">
                {entry.honors.join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
