import { SectionHeading } from './SectionHeading';

type SummaryProps = {
  summary: string;
  heading: string;
};

export function Summary({ summary, heading }: SummaryProps) {
  const sectionId = heading.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="resume-section mb-4" aria-labelledby={sectionId}>
      <SectionHeading id={sectionId}>{heading}</SectionHeading>
      <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
    </section>
  );
}
