import type { AssembledResume, ShowcaseEntry } from '@/types';
import { formatSingleDate } from '@/lib/formatting/dates';
import { parseHighlight } from '@/lib/formatting/markdown';
import { SectionHeading } from './SectionHeading';

type ExperienceEntry = AssembledResume['experience'][number];

type ExperienceProps = {
  entries: ExperienceEntry[];
  heading: string;
  locale?: 'en' | 'nl';
};

export function Experience({
  entries,
  heading,
  locale = 'en',
}: ExperienceProps) {
  if (entries.length === 0) return null;

  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <div className="space-y-6">
        {entries.map((entry) =>
          entry.expanded ? (
            <ExpandedEntry key={entry.id} entry={entry} locale={locale} />
          ) : (
            <MinimalEntry key={entry.id} entry={entry} locale={locale} />
          ),
        )}
      </div>
    </section>
  );
}

function ExpandedEntry({
  entry,
  locale,
}: {
  entry: ExperienceEntry;
  locale: 'en' | 'nl';
}) {
  const sections = entry.sections ?? {};

  return (
    <div>
      <div className="resume-section">
        <EntryHeader entry={entry} locale={locale} />
        {entry.technologies && entry.technologies.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {entry.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded bg-slate-100 px-1.5 py-px text-xs text-slate-500"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        {entry.narrative && (
          <div className="mt-1.5 space-y-1 text-sm leading-relaxed text-slate-700">
            {entry.narrative.split('\n\n').map((paragraph, i) => (
              <p key={i}>{parseHighlight(paragraph)}</p>
            ))}
          </div>
        )}
      </div>
      {Object.entries(sections).map(([heading, bullets]) => (
        <div key={heading} className="resume-section mt-2">
          <h4
            className="text-xs font-semibold"
            style={{ color: 'color-mix(in srgb, var(--accent) 60%, white)' }}
          >
            {heading}
          </h4>
          <ul className="mt-0.5 space-y-0.5">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="relative pl-3 text-sm leading-snug text-slate-700 before:absolute before:left-0 before:top-[0.4em] before:h-1 before:w-1 before:rounded-full before:bg-slate-500"
              >
                {parseHighlight(bullet)}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {entry.showcases && entry.showcases.length > 0 && (
        <div className="resume-section mt-2">
          <h4
            className="text-xs font-semibold"
            style={{ color: 'color-mix(in srgb, var(--accent) 60%, white)' }}
          >
            Showcases
          </h4>
          {entry.showcases.map((sc) => (
            <InlineShowcase key={sc.id} showcase={sc} />
          ))}
        </div>
      )}
    </div>
  );
}

function MinimalEntry({
  entry,
  locale,
}: {
  entry: ExperienceEntry;
  locale: 'en' | 'nl';
}) {
  return (
    <div className="resume-section">
      <EntryHeader entry={entry} locale={locale} />
      {entry.technologies && entry.technologies.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {entry.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded bg-slate-100 px-1.5 py-px text-xs text-slate-500"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      {entry.narrative && (
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
          {parseHighlight(entry.narrative)}
        </p>
      )}
    </div>
  );
}

function InlineShowcase({ showcase }: { showcase: ShowcaseEntry }) {
  const tagline =
    showcase.summary.split(/[.!?]|—/)[0]?.trim() ?? showcase.summary;

  return (
    <p className="mt-1 text-sm">
      <a
        href={showcase.repo}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-slate-800 underline"
      >
        {showcase.name}
      </a>
      <span className="text-slate-400"> — </span>
      <span className="text-slate-600">{tagline}</span>
    </p>
  );
}

function EntryHeader({
  entry,
  locale,
}: {
  entry: ExperienceEntry;
  locale: 'en' | 'nl';
}) {
  const present = locale === 'nl' ? 'Heden' : 'Present';
  const dates = `${formatSingleDate(entry.start, locale)} – ${entry.end ? formatSingleDate(entry.end, locale) : present}`;
  const dateLocation = entry.location ? `${dates} · ${entry.location}` : dates;

  return (
    <div className="flex items-baseline justify-between gap-2">
      <h3 className="text-sm font-semibold text-slate-800">
        <span>{entry.company}</span>
        <span className="text-slate-500"> — {entry.title}</span>
      </h3>
      <span className="shrink-0 text-xs text-slate-500">{dateLocation}</span>
    </div>
  );
}
