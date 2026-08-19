import type { ContentVault } from '@/lib/content/vault';
import type { ResumeConfig, AssembledResume, ShowcaseEntry } from '@/types';
import { assembledResumeSchema } from '@/schemas';

export function assembleResume(
  vault: ContentVault,
  config: ResumeConfig,
  configName?: string,
): AssembledResume {
  const expandSet = new Set(config.experience.expand);

  for (const id of config.experience.expand) {
    if (!vault.experience.some((e) => e.id === id)) {
      const source = configName ? `${configName}: ` : '';
      throw new Error(
        `${source}experience.expand references non-existent ID "${id}"`,
      );
    }
  }

  const experience = vault.experience
    .map((entry) => {
      const expanded = expandSet.has(entry.id);
      if (expanded) {
        let sections = entry.sections;
        if (config.experience.sections) {
          const allowed = new Set(config.experience.sections);
          sections = Object.fromEntries(
            Object.entries(entry.sections).filter(([key]) => allowed.has(key)),
          );
        }

        if (config.experience.maxAchievements !== undefined) {
          const cap = config.experience.maxAchievements;
          sections = Object.fromEntries(
            Object.entries(sections).map(([key, bullets]) =>
              key === 'Achievements'
                ? [key, bullets.slice(0, cap)]
                : [key, bullets],
            ),
          );
        }

        let technologies = entry.technologies;
        if (config.experience.maxTechnologies !== undefined && technologies) {
          technologies = technologies.slice(
            0,
            config.experience.maxTechnologies,
          );
        }

        const narrativeMode = config.experience.narrative ?? 'full';
        let narrative: string | undefined;
        if (narrativeMode === 'none') {
          narrative = undefined;
        } else if (narrativeMode === 'short' && entry.narrative) {
          narrative = entry.narrative.split('\n\n')[0];
        } else {
          narrative = entry.narrative;
        }

        return {
          id: entry.id,
          company: entry.company,
          title: entry.title,
          location: entry.location,
          start: entry.start,
          end: entry.end,
          technologies,
          narrative,
          sections,
          expanded: true,
        };
      }
      const minTechCap = config.experience.maxTechnologies ?? 5;
      let minTechnologies = entry.technologies;
      if (minTechnologies) {
        minTechnologies = minTechnologies.slice(0, minTechCap);
      }

      const minNarrativeMode = config.experience.narrative ?? 'short';
      let minNarrative: string | undefined;
      if (minNarrativeMode === 'none') {
        minNarrative = undefined;
      } else if (entry.narrative) {
        minNarrative = entry.narrative.split('\n\n')[0];
      }

      return {
        id: entry.id,
        company: entry.company,
        title: entry.title,
        location: entry.location,
        start: entry.start,
        end: entry.end,
        technologies: minTechnologies,
        narrative: minNarrative,
        expanded: false,
      };
    })
    .sort((a, b) => b.start.localeCompare(a.start)) as Array<
    AssembledResume['experience'][number] & {
      showcases?: ShowcaseEntry[];
    }
  >;

  const skills = resolveFilter(
    config.skills,
    vault.skills,
    (s) => s.category,
    'skills',
    configName,
  );

  const allShowcases = config.showcases
    ? resolveByIds(
        config.showcases,
        vault.showcases,
        (s) => s.id,
        'showcases',
        configName,
      )
    : undefined;

  const showcasesByExperience = new Map<string, typeof allShowcases>();
  const unattachedShowcases: NonNullable<typeof allShowcases> = [];
  if (allShowcases) {
    for (const sc of allShowcases) {
      const related = sc.related_experience;
      const matchedExpId = related?.find((id) => expandSet.has(id));
      if (matchedExpId) {
        const existing = showcasesByExperience.get(matchedExpId) ?? [];
        existing.push(sc);
        showcasesByExperience.set(matchedExpId, existing);
      } else {
        unattachedShowcases.push(sc);
      }
    }
  }

  for (const entry of experience) {
    const attached = showcasesByExperience.get(entry.id);
    if (attached && attached.length > 0) {
      entry.showcases = attached;
    }
  }

  const showcases =
    unattachedShowcases.length > 0 ? unattachedShowcases : undefined;

  const certifications = resolveFilter(
    config.certifications,
    vault.certifications,
    (c) => c.name,
    'certifications',
    configName,
  );

  const projects = resolveFilter(
    config.projects,
    vault.projects,
    (p) => p.name,
    'projects',
    configName,
  );

  const raw = {
    name: vault.settings.name,
    email: vault.settings.email,
    location: vault.settings.location,
    linkedin: vault.settings.linkedin,
    github: vault.settings.github,
    website: vault.settings.website,
    photo: vault.settings.photo,

    title: config.title,
    tagline: config.tagline,
    summary: config.summary,

    experience,
    education: vault.education,
    skills,
    showcases,
    certifications,
    projects,

    style: config.style,
    sectionOrder: config.sectionOrder,
  };

  return assembledResumeSchema.parse(raw);
}

function resolveFilter<T>(
  filter: 'all' | string[] | undefined,
  items: T[],
  getName: (item: T) => string,
  sectionName: string,
  configName?: string,
): T[] | undefined {
  if (filter === undefined) return undefined;
  if (filter === 'all') return items.length > 0 ? items : undefined;
  if (filter.length === 0) return undefined;

  const source = configName ? `${configName}: ` : '';
  return filter.map((name) => {
    const found = items.find((item) => getName(item) === name);
    if (!found) {
      throw new Error(
        `${source}${sectionName} references non-existent "${name}"`,
      );
    }
    return found;
  });
}

function resolveByIds<T>(
  ids: string[],
  items: T[],
  getId: (item: T) => string,
  sectionName: string,
  configName?: string,
): T[] | undefined {
  if (ids.length === 0) return undefined;

  const source = configName ? `${configName}: ` : '';
  return ids.map((id) => {
    const found = items.find((item) => getId(item) === id);
    if (!found) {
      throw new Error(
        `${source}${sectionName} references non-existent ID "${id}"`,
      );
    }
    return found;
  });
}
