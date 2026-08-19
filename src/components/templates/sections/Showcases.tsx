import type { ShowcaseEntry } from '@/types';
import { formatUrl } from '@/lib/formatting/urls';
import { parseHighlight } from '@/lib/formatting/markdown';
import { SectionHeading } from './SectionHeading';

type ShowcasesProps = {
  entries: ShowcaseEntry[];
  heading: string;
};

export function Showcases({ entries, heading }: ShowcasesProps) {
  if (entries.length === 0) return null;

  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="resume-section">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                {entry.name}
              </h3>
              <a
                href={entry.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-slate-500 underline"
              >
                {formatUrl(entry.repo)}
              </a>
            </div>
            {entry.technologies && entry.technologies.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-1">
                {entry.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {entry.summary}
            </p>
            {entry.highlights.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {entry.highlights.map((h) => (
                  <li
                    key={h}
                    className="relative pl-3 text-sm leading-snug text-slate-700 before:absolute before:left-0 before:top-[0.4em] before:h-1 before:w-1 before:rounded-full before:bg-slate-500"
                  >
                    {parseHighlight(h)}
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
