import { describe, expect, it } from 'vitest';
import {
  experienceEntrySchema,
  educationEntrySchema,
  skillCategorySchema,
  projectEntrySchema,
  showcaseEntrySchema,
  certificationEntrySchema,
  settingsSchema,
} from '@/schemas';

describe('experienceEntrySchema', () => {
  const valid = {
    id: 'hyperion-tech-lead',
    company: 'Hyperion Orbital Logistics',
    title: 'Tech Lead',
    start: '2023-03',
    narrative: 'Built a data platform.',
  };

  it('accepts minimal valid entry', () => {
    expect(experienceEntrySchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts all optional fields', () => {
    const full = {
      ...valid,
      location: 'Lower Puddlemere, Shire',
      end: '2025-03',
      draft: true,
      technologies: ['PySpark', 'Databricks'],
      sections: { Achievements: ['80% cost reduction'] },
    };
    expect(experienceEntrySchema.parse(full)).toMatchObject(full);
  });

  it('defaults draft to false', () => {
    const result = experienceEntrySchema.parse(valid);
    expect(result.draft).toBe(false);
  });

  it('defaults sections to empty object', () => {
    const result = experienceEntrySchema.parse(valid);
    expect(result.sections).toEqual({});
  });

  it('rejects missing id', () => {
    const { id: _, ...noId } = valid;
    expect(() => experienceEntrySchema.parse(noId)).toThrow();
  });

  it('rejects missing company', () => {
    const { company: _, ...noCompany } = valid;
    expect(() => experienceEntrySchema.parse(noCompany)).toThrow();
  });

  it('rejects missing title', () => {
    const { title: _, ...noTitle } = valid;
    expect(() => experienceEntrySchema.parse(noTitle)).toThrow();
  });

  it('rejects missing start', () => {
    const { start: _, ...noStart } = valid;
    expect(() => experienceEntrySchema.parse(noStart)).toThrow();
  });

  it('rejects invalid date format', () => {
    expect(() =>
      experienceEntrySchema.parse({ ...valid, start: '2024' }),
    ).toThrow('YYYY-MM');
  });

  it('rejects empty id', () => {
    expect(() => experienceEntrySchema.parse({ ...valid, id: '' })).toThrow();
  });
});

describe('educationEntrySchema', () => {
  const valid = {
    institution: 'University of Lower Puddlemere',
    degree: 'MSc',
    field: 'Applied Improbability',
    start: '2009-09',
  };

  it('accepts minimal valid entry', () => {
    expect(educationEntrySchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts all optional fields', () => {
    const full = {
      ...valid,
      end: '2011-08',
      gpa: '8.5/10',
      honors: ['Cum Laude'],
    };
    expect(educationEntrySchema.parse(full)).toMatchObject(full);
  });

  it('rejects missing institution', () => {
    const { institution: _, ...no } = valid;
    expect(() => educationEntrySchema.parse(no)).toThrow();
  });

  it('rejects invalid start date', () => {
    expect(() =>
      educationEntrySchema.parse({ ...valid, start: 'Sep 2012' }),
    ).toThrow('YYYY-MM');
  });
});

describe('skillCategorySchema', () => {
  it('accepts valid category', () => {
    const valid = { category: 'Data Engineering', skills: ['PySpark'] };
    expect(skillCategorySchema.parse(valid)).toMatchObject(valid);
  });

  it('rejects empty skills array', () => {
    expect(() =>
      skillCategorySchema.parse({ category: 'Empty', skills: [] }),
    ).toThrow();
  });

  it('rejects missing category', () => {
    expect(() => skillCategorySchema.parse({ skills: ['A'] })).toThrow();
  });
});

describe('projectEntrySchema', () => {
  const valid = { name: 'My Project', description: 'A project' };

  it('accepts minimal valid entry', () => {
    expect(projectEntrySchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts all optional fields', () => {
    const full = {
      ...valid,
      url: 'https://github.com/test/repo',
      technologies: ['TypeScript'],
      highlights: ['Fast', 'Reliable'],
    };
    expect(projectEntrySchema.parse(full)).toMatchObject(full);
  });

  it('rejects invalid url', () => {
    expect(() =>
      projectEntrySchema.parse({ ...valid, url: 'not-a-url' }),
    ).toThrow();
  });
});

describe('showcaseEntrySchema', () => {
  const valid = {
    id: 'workflow-api',
    name: 'Workflow API',
    repo: 'https://github.com/quantum-narwhal-labs/workflow-api',
    summary: 'A library for orchestrating notebooks.',
    highlights: ['Modularity', 'Testability'],
  };

  it('accepts valid entry', () => {
    expect(showcaseEntrySchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts optional fields', () => {
    const full = {
      ...valid,
      technologies: ['Python', 'Databricks'],
      related_experience: ['hyperion-tech-lead'],
    };
    expect(showcaseEntrySchema.parse(full)).toMatchObject(full);
  });

  it('rejects missing repo', () => {
    const { repo: _, ...noRepo } = valid;
    expect(() => showcaseEntrySchema.parse(noRepo)).toThrow();
  });

  it('rejects invalid repo URL', () => {
    expect(() =>
      showcaseEntrySchema.parse({ ...valid, repo: 'not-a-url' }),
    ).toThrow();
  });

  it('rejects missing highlights', () => {
    const { highlights: _, ...noHighlights } = valid;
    expect(() => showcaseEntrySchema.parse(noHighlights)).toThrow();
  });
});

describe('certificationEntrySchema', () => {
  const valid = {
    name: 'QC-118',
    issuer: 'Quantum Cloud',
    obtained: '2019-03',
  };

  it('accepts valid entry', () => {
    expect(certificationEntrySchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts optional fields', () => {
    const full = {
      ...valid,
      expires: '2022-03',
      url: 'https://learn.quantumcloud.example/cert',
    };
    expect(certificationEntrySchema.parse(full)).toMatchObject(full);
  });

  it('rejects missing issuer', () => {
    const { issuer: _, ...no } = valid;
    expect(() => certificationEntrySchema.parse(no)).toThrow();
  });

  it('rejects invalid obtained date', () => {
    expect(() =>
      certificationEntrySchema.parse({ ...valid, obtained: 'June 2021' }),
    ).toThrow('YYYY-MM');
  });
});

describe('settingsSchema', () => {
  const valid = {
    name: 'Dr. Ignatius Featherstone-Bloom',
    email: 'ignatius@featherstone-bloom.example',
  };

  it('accepts minimal valid settings', () => {
    expect(settingsSchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts all optional fields', () => {
    const full = {
      ...valid,
      location: 'Lower Puddlemere, Shire',
      linkedin: 'https://linkedin.com/in/ignatius-featherstone-bloom',
      github: 'https://github.com/quantum-narwhal-labs',
      website: 'https://example.com',
    };
    expect(settingsSchema.parse(full)).toMatchObject(full);
  });

  it('rejects missing name', () => {
    const { name: _, ...no } = valid;
    expect(() => settingsSchema.parse(no)).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() =>
      settingsSchema.parse({ ...valid, email: 'not-an-email' }),
    ).toThrow();
  });

  it('rejects invalid linkedin URL', () => {
    expect(() =>
      settingsSchema.parse({ ...valid, linkedin: 'not-a-url' }),
    ).toThrow();
  });
});
