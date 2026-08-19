const headings = {
  en: {
    summary: 'Summary',
    experience: 'Experience',
    showcases: 'Showcases',
    skills: 'Skills',
    education: 'Education',
    certifications: 'Certifications',
    projects: 'Projects',
  },
  nl: {
    summary: 'Samenvatting',
    experience: 'Werkervaring',
    showcases: 'Showcases',
    skills: 'Vaardigheden',
    education: 'Opleiding',
    certifications: 'Certificeringen',
    projects: 'Projecten',
  },
} as const;

type Locale = keyof typeof headings;
type SectionKey = keyof (typeof headings)['en'];

export function getSectionHeading(section: SectionKey, locale: Locale): string {
  return headings[locale][section];
}
