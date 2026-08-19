import { describe, it, expect } from 'vitest';
import { parseExperience } from '@/lib/content/parse-experience';
import type { ExperienceEntry } from '@/types';

const VALID_RAW = `---
id: test-role
company: Test Corp
title: Senior Engineer
location: Newfield, Testland
start: 2022-01
end: 2024-06
technologies:
  - TypeScript
  - Node.js
---

A narrative about the role that spans multiple sentences. This describes the context.

## Achievements

- First achievement with impact
- Second achievement with metric

## Leadership

- Led a team of five engineers
`;

const MINIMAL_RAW = `---
id: minimal-role
company: Minimal Co
title: Engineer
start: 2023-03
---
`;

describe('when parsing a valid experience file', () => {
  it('returns an ExperienceEntry (not null)', () => {
    const result = parseExperience(VALID_RAW, 'test.md');
    expect(result).not.toBeNull();
  });

  it('maps id, company, title, location from frontmatter', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.id).toBe('test-role');
    expect(result.company).toBe('Test Corp');
    expect(result.title).toBe('Senior Engineer');
    expect(result.location).toBe('Newfield, Testland');
  });

  it('maps start and end dates from frontmatter', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.start).toBe('2022-01');
    expect(result.end).toBe('2024-06');
  });

  it('maps technologies array from frontmatter', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.technologies).toEqual(['TypeScript', 'Node.js']);
  });

  it('extracts narrative from body text before first ## heading', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.narrative).toContain('A narrative about the role');
    expect(result.narrative).toContain('This describes the context');
  });

  it('does not include ## heading text in the narrative', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.narrative).not.toContain('Achievements');
    expect(result.narrative).not.toContain('Leadership');
  });

  it('parses ## Achievements bullets into sections record', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.sections['Achievements']).toEqual([
      'First achievement with impact',
      'Second achievement with metric',
    ]);
  });

  it('parses multiple ## sections into separate sections entries', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(Object.keys(result.sections)).toContain('Achievements');
    expect(Object.keys(result.sections)).toContain('Leadership');
  });

  it('parses the Leadership section bullets correctly', () => {
    const result = parseExperience(VALID_RAW, 'test.md') as ExperienceEntry;
    expect(result.sections['Leadership']).toEqual([
      'Led a team of five engineers',
    ]);
  });
});

describe('when parsing a minimal valid experience file', () => {
  it('returns an ExperienceEntry with empty narrative and empty sections', () => {
    const result = parseExperience(
      MINIMAL_RAW,
      'minimal.md',
    ) as ExperienceEntry;
    expect(result).not.toBeNull();
    expect(result.narrative).toBe('');
    expect(result.sections).toEqual({});
  });

  it('has no end date', () => {
    const result = parseExperience(
      MINIMAL_RAW,
      'minimal.md',
    ) as ExperienceEntry;
    expect(result.end).toBeUndefined();
  });
});

describe('when the experience file has draft: true', () => {
  it('returns null', () => {
    const raw = `---
id: draft-role
company: Draft Co
title: Engineer
start: 2022-01
draft: true
---

Some narrative.
`;
    const result = parseExperience(raw, 'draft.md');
    expect(result).toBeNull();
  });
});

describe('when the experience file has draft: false explicitly', () => {
  it('returns an ExperienceEntry (not null)', () => {
    const raw = `---
id: published-role
company: Published Co
title: Engineer
start: 2022-01
draft: false
---
`;
    const result = parseExperience(raw, 'published.md');
    expect(result).not.toBeNull();
  });
});

describe('when required frontmatter fields are missing', () => {
  it('throws and includes filename in the error message when id is missing', () => {
    const raw = `---
company: No ID Corp
title: Engineer
start: 2022-01
---
`;
    expect(() => parseExperience(raw, 'experience/no-id.md')).toThrow(
      'experience/no-id.md',
    );
  });

  it('throws when company is missing', () => {
    const raw = `---
id: no-company
title: Engineer
start: 2022-01
---
`;
    expect(() => parseExperience(raw, 'no-company.md')).toThrow();
  });

  it('throws when title is missing', () => {
    const raw = `---
id: no-title
company: Some Corp
start: 2022-01
---
`;
    expect(() => parseExperience(raw, 'no-title.md')).toThrow();
  });

  it('throws when start is missing', () => {
    const raw = `---
id: no-start
company: Some Corp
title: Engineer
---
`;
    expect(() => parseExperience(raw, 'no-start.md')).toThrow();
  });
});

describe('when the experience file has an invalid date format', () => {
  it('throws on start date that is not YYYY-MM', () => {
    const raw = `---
id: bad-date
company: Some Corp
title: Engineer
start: January 2022
---
`;
    expect(() => parseExperience(raw, 'bad-date.md')).toThrow();
  });

  it('throws on end date that is not YYYY-MM', () => {
    const raw = `---
id: bad-end-date
company: Some Corp
title: Engineer
start: 2022-01
end: 2024
---
`;
    expect(() => parseExperience(raw, 'bad-end-date.md')).toThrow();
  });
});

describe('when the body has no ## sections', () => {
  it('sets narrative to the full body text (trimmed)', () => {
    const raw = `---
id: no-sections
company: Corp
title: Engineer
start: 2021-06
---

Just a plain narrative with no sections at all.
`;
    const result = parseExperience(raw, 'no-sections.md') as ExperienceEntry;
    expect(result.narrative).toBe(
      'Just a plain narrative with no sections at all.',
    );
  });

  it('has no named sections', () => {
    const raw = `---
id: no-sections
company: Corp
title: Engineer
start: 2021-06
---

Just a plain narrative with no sections at all.
`;
    const result = parseExperience(raw, 'no-sections.md') as ExperienceEntry;
    const namedKeys = Object.keys(result.sections).filter((k) => k.length > 0);
    expect(namedKeys).toHaveLength(0);
  });
});
