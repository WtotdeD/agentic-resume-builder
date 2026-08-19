import type { AssembledResume } from '@/types';
import { getSectionHeading } from '@/lib/i18n/section-headings';
import { Header } from './sections/Header';
import { Summary } from './sections/Summary';
import { Experience } from './sections/Experience';
import { Education } from './sections/Education';
import { Skills } from './sections/Skills';
import { Showcases } from './sections/Showcases';
import { Certifications } from './sections/Certifications';
import { Projects } from './sections/Projects';

type ResumeTemplateProps = {
  resume: AssembledResume;
  locale?: 'en' | 'nl';
};

type SectionKey = NonNullable<AssembledResume['sectionOrder']>[number];

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'summary',
  'experience',
  'showcases',
  'skills',
  'education',
  'certifications',
  'projects',
];

function SectionRenderer({
  section,
  resume,
  locale,
}: {
  section: SectionKey;
  resume: AssembledResume;
  locale: 'en' | 'nl';
}) {
  const heading = getSectionHeading(section, locale);

  switch (section) {
    case 'summary':
      return <Summary summary={resume.summary} heading={heading} />;
    case 'experience':
      return (
        <Experience
          entries={resume.experience}
          heading={heading}
          locale={locale}
        />
      );
    case 'showcases':
      return resume.showcases ? (
        <Showcases entries={resume.showcases} heading={heading} />
      ) : null;
    case 'skills':
      return resume.skills ? (
        <Skills categories={resume.skills} heading={heading} />
      ) : null;
    case 'education':
      return (
        <Education
          entries={resume.education}
          heading={heading}
          locale={locale}
        />
      );
    case 'certifications':
      return resume.certifications ? (
        <Certifications
          entries={resume.certifications}
          heading={heading}
          locale={locale}
        />
      ) : null;
    case 'projects':
      return resume.projects ? (
        <Projects entries={resume.projects} heading={heading} />
      ) : null;
  }
}

const COMPACT_SECTIONS = new Set<SectionKey>(['certifications', 'education']);

export function ResumeTemplate({ resume, locale = 'en' }: ResumeTemplateProps) {
  const accent = resume.style?.accent;
  const order = resume.sectionOrder ?? DEFAULT_SECTION_ORDER;

  const groups: Array<SectionKey | SectionKey[]> = [];
  for (let i = 0; i < order.length; i++) {
    const current = order[i]!;
    const next = order[i + 1];
    if (COMPACT_SECTIONS.has(current) && next && COMPACT_SECTIONS.has(next)) {
      groups.push([current, next]);
      i++;
    } else {
      groups.push(current);
    }
  }

  return (
    <div
      lang={locale}
      className="resume-container mx-auto min-h-[297mm] w-[210mm] bg-white px-12 py-[15mm] font-sans text-slate-800"
      style={
        accent ? ({ '--accent': accent } as React.CSSProperties) : undefined
      }
    >
      <Header
        name={resume.name}
        title={resume.title}
        tagline={resume.tagline}
        email={resume.email}
        location={resume.location}
        linkedin={resume.linkedin}
        github={resume.github}
        website={resume.website}
        photo={resume.photo}
      />

      {groups.map((group) =>
        Array.isArray(group) ? (
          <div key={group.join('-')} className="grid grid-cols-2 gap-x-8">
            {group.map((section) => (
              <SectionRenderer
                key={section}
                section={section}
                resume={resume}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <SectionRenderer
            key={group}
            section={group}
            resume={resume}
            locale={locale}
          />
        ),
      )}
    </div>
  );
}
