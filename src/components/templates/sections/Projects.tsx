import type { ProjectEntry } from '@/types';
import { formatUrl } from '@/lib/formatting/urls';
import { SectionHeading } from './SectionHeading';

type ProjectsProps = {
  entries: ProjectEntry[];
  heading: string;
};

export function Projects({ entries, heading }: ProjectsProps) {
  if (entries.length === 0) return null;

  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.name} className="resume-section">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                {entry.name}
              </h3>
              {entry.url && (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-slate-500 underline"
                >
                  {formatUrl(entry.url)}
                </a>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{entry.description}</p>
            {entry.technologies && entry.technologies.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-500">
                {entry.technologies.join(' · ')}
              </p>
            )}
            {entry.highlights && entry.highlights.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {entry.highlights.map((h) => (
                  <li
                    key={h}
                    className="relative pl-3 text-sm leading-snug text-slate-700 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-slate-500"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
