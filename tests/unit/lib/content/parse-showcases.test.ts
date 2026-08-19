import { describe, it, expect } from 'vitest';
import { parseShowcases } from '@/lib/content/parse-showcases';
import type { ShowcaseEntry } from '@/types';

const FULL_RAW = `## Digital Resume Builder
id: digital-resume
repo: https://github.com/test/digital-resume
technologies: TypeScript, Next.js, Tailwind CSS
related_experience: role-a, role-b

Markdown-driven resume builder with content vault and Puppeteer PDF export.

### Highlights

- Content-first architecture
- Audience targeting via YAML config
- A4 PDF export with self-hosted fonts
`;

const MINIMAL_RAW = `## Simple Project
id: simple-project
repo: https://github.com/test/simple

A minimal project description.
`;

describe('when parsing a fully specified showcase entry', () => {
  it('returns one ShowcaseEntry', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result).toHaveLength(1);
  });

  it('maps id and name from key-value and heading', () => {
    const result = parseShowcases(FULL_RAW);
    const entry = result[0] as ShowcaseEntry;
    expect(entry.id).toBe('digital-resume');
    expect(entry.name).toBe('Digital Resume Builder');
  });

  it('maps repo URL', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result[0]!.repo).toBe('https://github.com/test/digital-resume');
  });

  it('parses comma-separated technologies into an array', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result[0]!.technologies).toEqual([
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
    ]);
  });

  it('parses comma-separated related_experience into an array', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result[0]!.related_experience).toEqual(['role-a', 'role-b']);
  });

  it('extracts summary from non-kv, non-heading prose lines', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result[0]!.summary).toContain('Markdown-driven resume builder');
  });

  it('does not include key-value lines in the summary', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result[0]!.summary).not.toContain('id:');
    expect(result[0]!.summary).not.toContain('repo:');
    expect(result[0]!.summary).not.toContain('technologies:');
  });

  it('extracts highlights from ### Highlights bullets', () => {
    const result = parseShowcases(FULL_RAW);
    expect(result[0]!.highlights).toEqual([
      'Content-first architecture',
      'Audience targeting via YAML config',
      'A4 PDF export with self-hosted fonts',
    ]);
  });
});

describe('when parsing a minimal showcase entry (no optional fields)', () => {
  it('returns a valid ShowcaseEntry', () => {
    const result = parseShowcases(MINIMAL_RAW);
    expect(result).toHaveLength(1);
    const entry = result[0] as ShowcaseEntry;
    expect(entry.id).toBe('simple-project');
    expect(entry.name).toBe('Simple Project');
    expect(entry.repo).toBe('https://github.com/test/simple');
    expect(entry.summary).toBe('A minimal project description.');
  });

  it('leaves technologies undefined when not present', () => {
    const result = parseShowcases(MINIMAL_RAW);
    expect(result[0]!.technologies).toBeUndefined();
  });

  it('leaves related_experience undefined when not present', () => {
    const result = parseShowcases(MINIMAL_RAW);
    expect(result[0]!.related_experience).toBeUndefined();
  });

  it('returns an empty highlights array when no ### Highlights section', () => {
    const result = parseShowcases(MINIMAL_RAW);
    expect(result[0]!.highlights).toEqual([]);
  });
});

describe('when parsing multiple showcase entries', () => {
  it('returns one entry per ## section', () => {
    const raw = `## Project Alpha
id: alpha
repo: https://github.com/test/alpha

Alpha summary.

## Project Beta
id: beta
repo: https://github.com/test/beta

Beta summary.
`;
    const result = parseShowcases(raw);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('alpha');
    expect(result[1]!.id).toBe('beta');
  });
});

describe('when required fields are missing', () => {
  it('throws when id is missing', () => {
    const raw = `## Missing ID
repo: https://github.com/test/repo

A summary.
`;
    expect(() => parseShowcases(raw)).toThrow();
  });

  it('throws when repo is missing', () => {
    const raw = `## Missing Repo
id: missing-repo

A summary.
`;
    expect(() => parseShowcases(raw)).toThrow();
  });

  it('throws when repo is not a valid URL', () => {
    const raw = `## Bad URL
id: bad-url
repo: not-a-valid-url

A summary.
`;
    expect(() => parseShowcases(raw)).toThrow();
  });

  it('throws when summary is empty (only kv and headings)', () => {
    const raw = `## No Summary
id: no-summary
repo: https://github.com/test/repo
`;
    expect(() => parseShowcases(raw)).toThrow();
  });
});
