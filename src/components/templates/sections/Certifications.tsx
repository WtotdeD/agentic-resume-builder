import type { CertificationEntry } from '@/types';
import { formatSingleDate } from '@/lib/formatting/dates';
import { SectionHeading } from './SectionHeading';

type CertificationsProps = {
  entries: CertificationEntry[];
  heading: string;
  locale?: 'en' | 'nl';
};

export function Certifications({
  entries,
  heading,
  locale = 'en',
}: CertificationsProps) {
  if (entries.length === 0) return null;

  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="resume-section mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <div className="space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.name}
            className="flex items-baseline justify-between gap-2 text-sm"
          >
            <span>
              <span className="font-medium text-slate-800">{entry.name}</span>
              <span className="text-slate-500"> — {entry.issuer}</span>
            </span>
            <span className="shrink-0 text-xs text-slate-500">
              {formatSingleDate(entry.obtained, locale)}
              {entry.expires &&
                ` · ${locale === 'nl' ? 'Verloopt' : 'Expires'} ${formatSingleDate(entry.expires, locale)}`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
