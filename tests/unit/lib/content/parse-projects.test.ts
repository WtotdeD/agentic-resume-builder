import { describe, it, expect } from 'vitest';
import { parseProjects } from '@/lib/content/parse-projects';
import type { ProjectEntry } from '@/types';

const FULL_RAW = `## Digital Resume Builder
description: Markdown-driven resume generator with Puppeteer PDF export
url: https://github.com/test/digital-resume
technologies: TypeScript, Next.js, Tailwind CSS
highlights: Content-first architecture | Audience targeting via YAML config | A4 PDF export
`;

const MINIMAL_RAW = `## Simple Tool
description: A minimal CLI utility
`;

describe('when parsing a fully specified project entry', () => {
  it('returns one ProjectEntry', () => {
    const result = parseProjects(FULL_RAW);
    expect(result).toHaveLength(1);
  });

  it('maps name from section heading', () => {
    const result = parseProjects(FULL_RAW);
    const entry = result[0] as ProjectEntry;
    expect(entry.name).toBe('Digital Resume Builder');
  });

  it('maps description from key-value', () => {
    const result = parseProjects(FULL_RAW);
    expect(result[0]!.description).toBe(
      'Markdown-driven resume generator with Puppeteer PDF export',
    );
  });

  it('maps url from key-value', () => {
    const result = parseProjects(FULL_RAW);
    expect(result[0]!.url).toBe('https://github.com/test/digital-resume');
  });

  it('parses comma-separated technologies into an array', () => {
    const result = parseProjects(FULL_RAW);
    expect(result[0]!.technologies).toEqual([
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
    ]);
  });

  it('parses pipe-separated highlights into an array', () => {
    const result = parseProjects(FULL_RAW);
    expect(result[0]!.highlights).toEqual([
      'Content-first architecture',
      'Audience targeting via YAML config',
      'A4 PDF export',
    ]);
  });
});

describe('when parsing a minimal project entry (no optional fields)', () => {
  it('returns a valid ProjectEntry', () => {
    const result = parseProjects(MINIMAL_RAW);
    expect(result).toHaveLength(1);
    const entry = result[0] as ProjectEntry;
    expect(entry.name).toBe('Simple Tool');
    expect(entry.description).toBe('A minimal CLI utility');
  });

  it('leaves url undefined when not present', () => {
    const result = parseProjects(MINIMAL_RAW);
    expect(result[0]!.url).toBeUndefined();
  });

  it('leaves technologies undefined when not present', () => {
    const result = parseProjects(MINIMAL_RAW);
    expect(result[0]!.technologies).toBeUndefined();
  });

  it('leaves highlights undefined when not present', () => {
    const result = parseProjects(MINIMAL_RAW);
    expect(result[0]!.highlights).toBeUndefined();
  });
});

describe('when parsing multiple project entries', () => {
  it('returns one entry per ## section', () => {
    const raw = `## Project Alpha
description: Alpha project

## Project Beta
description: Beta project
`;
    const result = parseProjects(raw);
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe('Project Alpha');
    expect(result[1]!.name).toBe('Project Beta');
  });
});

describe('when required fields are missing', () => {
  it('throws when description is missing', () => {
    const raw = `## No Description
url: https://github.com/test/repo
`;
    expect(() => parseProjects(raw)).toThrow();
  });
});
