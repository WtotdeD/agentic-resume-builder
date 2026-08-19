import fs from 'node:fs';
import path from 'node:path';
import type {
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  ProjectEntry,
  ShowcaseEntry,
  CertificationEntry,
  Settings,
} from '@/types';
import { parseExperience } from './parse-experience';
import { parseEducation } from './parse-education';
import { parseSkills } from './parse-skills';
import { parseProjects } from './parse-projects';
import { parseShowcases } from './parse-showcases';
import { parseCertifications } from './parse-certifications';
import { parseSettings } from './parse-settings';

export type ContentVault = {
  settings: Settings;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  projects: ProjectEntry[];
  showcases: ShowcaseEntry[];
  certifications: CertificationEntry[];
};

export function loadContentVault(
  contentDir: string,
  locale: 'en' | 'nl' = 'en',
): ContentVault {
  const readFile = (rel: string) =>
    fs.readFileSync(path.join(contentDir, rel), 'utf-8');

  const fallbacks: string[] = [];

  function resolveFile(name: string): string | null {
    if (locale === 'nl') {
      const nlRel = `${name}.nl.md`;
      if (fs.existsSync(path.join(contentDir, nlRel))) return nlRel;
      fallbacks.push(`${name}.nl.md (missing)`);
    }
    const enRel = `${name}.md`;
    return fs.existsSync(path.join(contentDir, enRel)) ? enRel : null;
  }

  const settings = parseSettings(readFile('settings.yaml'));

  const experienceDir = path.join(contentDir, 'experience');
  const experience: ExperienceEntry[] = [];

  if (fs.existsSync(experienceDir)) {
    const allMd = fs
      .readdirSync(experienceDir)
      .filter((f) => f.endsWith('.md'));

    if (locale === 'nl') {
      const baseNameSet = new Set(
        allMd.map((f) =>
          f.endsWith('.nl.md') ? f.slice(0, -6) : f.slice(0, -3),
        ),
      );
      const baseNames = Array.from(baseNameSet).sort();

      for (const base of baseNames) {
        const nlFile = `${base}.nl.md`;
        const nlPath = path.join(experienceDir, nlFile);

        if (fs.existsSync(nlPath)) {
          const entry = parseExperience(
            fs.readFileSync(nlPath, 'utf-8'),
            `content/experience/${nlFile}`,
          );
          if (entry) {
            experience.push(entry);
            continue;
          }
          fallbacks.push(`experience/${nlFile} (draft)`);
        }

        const enFile = `${base}.md`;
        const enPath = path.join(experienceDir, enFile);
        if (fs.existsSync(enPath)) {
          const entry = parseExperience(
            fs.readFileSync(enPath, 'utf-8'),
            `content/experience/${enFile}`,
          );
          if (entry) experience.push(entry);
        }
      }
    } else {
      const enFiles = allMd.filter((f) => !f.slice(0, -3).includes('.')).sort();
      for (const file of enFiles) {
        const raw = fs.readFileSync(path.join(experienceDir, file), 'utf-8');
        const entry = parseExperience(raw, `content/experience/${file}`);
        if (entry) experience.push(entry);
      }
    }
  }

  const seenExperienceIds = new Set<string>();
  for (const entry of experience) {
    if (seenExperienceIds.has(entry.id)) {
      throw new Error(`Duplicate experience ID: "${entry.id}"`);
    }
    seenExperienceIds.add(entry.id);
  }

  const educationFile = resolveFile('education');
  const education = educationFile
    ? parseEducation(readFile(educationFile))
    : [];

  const skillsFile = resolveFile('skills');
  const skills = skillsFile ? parseSkills(readFile(skillsFile)) : [];

  const projectsFile = resolveFile('projects');
  const projects = projectsFile ? parseProjects(readFile(projectsFile)) : [];

  const showcasesFile = resolveFile('showcases');
  const showcases = showcasesFile
    ? parseShowcases(readFile(showcasesFile))
    : [];

  const seenShowcaseIds = new Set<string>();
  for (const entry of showcases) {
    if (seenShowcaseIds.has(entry.id)) {
      throw new Error(`Duplicate showcase ID: "${entry.id}"`);
    }
    seenShowcaseIds.add(entry.id);
  }

  const certificationsFile = resolveFile('certifications');
  const certifications = certificationsFile
    ? parseCertifications(readFile(certificationsFile))
    : [];

  if (fallbacks.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(`[vault] NL fallback: ${fallbacks.join(', ')}`);
  }

  return {
    settings,
    experience,
    education,
    skills,
    projects,
    showcases,
    certifications,
  };
}
