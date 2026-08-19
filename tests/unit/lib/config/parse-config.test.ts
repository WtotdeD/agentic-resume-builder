import { describe, it, expect } from 'vitest';
import { parseResumeConfig } from '@/lib/config/parse-config';
import type { ResumeConfig } from '@/types';

const FULL_CONFIG_YAML = `
title: "Senior Data Engineer"
tagline: "Building scalable data platforms"
summary: "10 years of experience building data pipelines on Azure."
experience:
  expand:
    - role-a
    - role-b
  sections:
    - Achievements
    - Impact
skills: all
certifications: all
projects:
  - "Project X"
showcases:
  - showcase-a
style:
  accent: "#ff5500"
`;

const MINIMAL_CONFIG_YAML = `
title: "Engineer"
summary: "Brief summary."
experience:
  expand:
    - role-a
`;

describe('when parsing a valid YAML config with all fields', () => {
  it('returns a typed ResumeConfig object', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('parses title correctly', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.title).toBe('Senior Data Engineer');
  });

  it('parses tagline correctly', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.tagline).toBe('Building scalable data platforms');
  });

  it('parses summary correctly', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.summary).toBe(
      '10 years of experience building data pipelines on Azure.',
    );
  });

  it('parses experience.expand as an array of IDs', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.experience.expand).toEqual(['role-a', 'role-b']);
  });

  it('parses experience.sections as an array of section names', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.experience.sections).toEqual(['Achievements', 'Impact']);
  });

  it('parses skills as "all"', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.skills).toBe('all');
  });

  it('parses certifications as "all"', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.certifications).toBe('all');
  });

  it('parses projects as an array', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.projects).toEqual(['Project X']);
  });

  it('parses showcases as an array', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.showcases).toEqual(['showcase-a']);
  });

  it('parses style.accent as the hex color', () => {
    const result = parseResumeConfig(FULL_CONFIG_YAML);
    expect(result.style?.accent).toBe('#ff5500');
  });
});

describe('when parsing a minimal config (title, summary, experience.expand only)', () => {
  it('returns a valid ResumeConfig', () => {
    const result = parseResumeConfig(MINIMAL_CONFIG_YAML);
    expect(result).toBeDefined();
  });

  it('has the title and summary set', () => {
    const result = parseResumeConfig(MINIMAL_CONFIG_YAML);
    expect(result.title).toBe('Engineer');
    expect(result.summary).toBe('Brief summary.');
  });

  it('has experience.expand populated', () => {
    const result = parseResumeConfig(MINIMAL_CONFIG_YAML);
    expect(result.experience.expand).toEqual(['role-a']);
  });

  it('has undefined tagline, skills, certifications, projects, showcases, style', () => {
    const result = parseResumeConfig(MINIMAL_CONFIG_YAML);
    expect(result.tagline).toBeUndefined();
    expect(result.skills).toBeUndefined();
    expect(result.certifications).toBeUndefined();
    expect(result.projects).toBeUndefined();
    expect(result.showcases).toBeUndefined();
    expect(result.style).toBeUndefined();
  });
});

describe('when parsing configs with "all" for section filters', () => {
  it('accepts "all" for skills', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
skills: all
`;
    const result = parseResumeConfig(yaml);
    expect(result.skills).toBe('all');
  });

  it('accepts "all" for certifications', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
certifications: all
`;
    const result = parseResumeConfig(yaml);
    expect(result.certifications).toBe('all');
  });

  it('accepts "all" for projects', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
projects: all
`;
    const result = parseResumeConfig(yaml);
    expect(result.projects).toBe('all');
  });
});

describe('when parsing configs with array for section filters', () => {
  it('accepts an array for skills', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
skills:
  - Languages
  - Cloud
`;
    const result = parseResumeConfig(yaml);
    expect(result.skills).toEqual(['Languages', 'Cloud']);
  });

  it('accepts an array for certifications', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
certifications:
  - Cert A
`;
    const result = parseResumeConfig(yaml);
    expect(result.certifications).toEqual(['Cert A']);
  });

  it('accepts an array for projects', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
projects:
  - Project X
  - Project Y
`;
    const result = parseResumeConfig(yaml);
    expect(result.projects).toEqual(['Project X', 'Project Y']);
  });
});

describe('when parsing an invalid config with missing required fields', () => {
  it('throws when title is missing', () => {
    const yaml = `
summary: "A summary."
experience:
  expand: []
`;
    expect(() => parseResumeConfig(yaml)).toThrow();
  });

  it('throws when summary is missing', () => {
    const yaml = `
title: "A title"
experience:
  expand: []
`;
    expect(() => parseResumeConfig(yaml)).toThrow();
  });

  it('throws when experience.expand is missing', () => {
    const yaml = `
title: "A title"
summary: "A summary."
experience:
  sections:
    - Achievements
`;
    expect(() => parseResumeConfig(yaml)).toThrow();
  });
});

describe('when parsing a config with an invalid hex color in style.accent', () => {
  it('throws on a 3-digit shorthand hex color', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
style:
  accent: "#f00"
`;
    expect(() => parseResumeConfig(yaml)).toThrow();
  });

  it('throws on a non-hex color string', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
style:
  accent: "red"
`;
    expect(() => parseResumeConfig(yaml)).toThrow();
  });

  it('throws on a hex color missing the # prefix', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
style:
  accent: "ff0000"
`;
    expect(() => parseResumeConfig(yaml)).toThrow();
  });

  it('accepts a valid 6-digit hex color', () => {
    const yaml = `
title: T
summary: S
experience:
  expand: []
style:
  accent: "#aabbcc"
`;
    const result = parseResumeConfig(yaml);
    expect(result.style?.accent).toBe('#aabbcc');
  });
});
