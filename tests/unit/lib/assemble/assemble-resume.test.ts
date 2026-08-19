import { describe, it, expect } from 'vitest';
import { assembleResume } from '@/lib/assemble/assemble-resume';
import type { ContentVault } from '@/lib/content/vault';
import type { ResumeConfig, AssembledResume } from '@/types';

const testVault: ContentVault = {
  settings: {
    name: 'Test User',
    email: 'test@example.com',
    location: 'Newfield',
    linkedin: 'https://linkedin.com/in/test',
    github: 'https://github.com/test',
  },
  experience: [
    {
      id: 'role-a',
      company: 'Company A',
      title: 'Engineer',
      start: '2023-01',
      narrative: 'Did things at A.',
      sections: { Achievements: ['Built system'] },
      draft: false,
    },
    {
      id: 'role-b',
      company: 'Company B',
      title: 'Senior',
      start: '2024-06',
      narrative: 'Led team at B.',
      sections: {
        Achievements: ['Led project'],
        Leadership: ['Mentored 3 juniors'],
      },
      draft: false,
    },
    {
      id: 'role-c',
      company: 'Company C',
      title: 'Junior',
      start: '2020-03',
      end: '2022-12',
      narrative: 'Learned things.',
      sections: {},
      draft: false,
    },
    {
      id: 'role-d',
      company: 'Company D',
      title: 'Intern',
      start: '2019-01',
      end: '2019-06',
      narrative: 'Interned.',
      sections: {},
      draft: false,
    },
    {
      id: 'role-e',
      company: 'Company E',
      title: 'Contractor',
      start: '2021-08',
      end: '2023-05',
      narrative: 'Contracted.',
      sections: {},
      draft: false,
    },
  ],
  education: [
    {
      institution: 'University',
      degree: 'MSc',
      field: 'CS',
      start: '2016-09',
      end: '2018-06',
    },
  ],
  skills: [
    { category: 'Languages', skills: ['TypeScript', 'Python'] },
    { category: 'Cloud', skills: ['Azure', 'AWS'] },
    { category: 'Tools', skills: ['Docker', 'Git'] },
  ],
  projects: [{ name: 'Project X', description: 'A project' }],
  showcases: [
    {
      id: 'showcase-a',
      name: 'Showcase A',
      repo: 'https://github.com/test/a',
      summary: 'A showcase.',
      highlights: ['Fast'],
    },
  ],
  certifications: [
    { name: 'Cert A', issuer: 'Issuer A', obtained: '2023-01' },
    { name: 'Cert B', issuer: 'Issuer B', obtained: '2024-01' },
  ],
};

function makeConfig(overrides: Partial<ResumeConfig> = {}): ResumeConfig {
  return {
    title: 'Software Engineer',
    summary: 'A great engineer.',
    experience: { expand: [] },
    ...overrides,
  };
}

describe('when expanding 2 of 5 experiences', () => {
  it('returns all 5 experience entries', () => {
    const config = makeConfig({ experience: { expand: ['role-a', 'role-b'] } });
    const result = assembleResume(testVault, config);
    expect(result.experience).toHaveLength(5);
  });

  it('marks role-a as expanded with narrative and sections', () => {
    const config = makeConfig({ experience: { expand: ['role-a', 'role-b'] } });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-a');
    expect(entry?.expanded).toBe(true);
    expect(entry?.narrative).toBe('Did things at A.');
    expect(entry?.sections).toEqual({ Achievements: ['Built system'] });
  });

  it('marks role-b as expanded with narrative and sections', () => {
    const config = makeConfig({ experience: { expand: ['role-a', 'role-b'] } });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-b');
    expect(entry?.expanded).toBe(true);
    expect(entry?.narrative).toBe('Led team at B.');
  });

  it('marks role-c as not expanded with first-paragraph narrative and no sections', () => {
    const config = makeConfig({ experience: { expand: ['role-a', 'role-b'] } });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-c');
    expect(entry?.expanded).toBe(false);
    expect(entry?.narrative).toBe('Learned things.');
    expect(entry?.sections).toBeUndefined();
  });

  it('marks role-d as not expanded', () => {
    const config = makeConfig({ experience: { expand: ['role-a', 'role-b'] } });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-d');
    expect(entry?.expanded).toBe(false);
  });

  it('marks role-e as not expanded', () => {
    const config = makeConfig({ experience: { expand: ['role-a', 'role-b'] } });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-e');
    expect(entry?.expanded).toBe(false);
  });
});

describe('when sorting experience entries', () => {
  it('sorts experience by start date descending (most recent first)', () => {
    const config = makeConfig({ experience: { expand: ['role-a'] } });
    const result = assembleResume(testVault, config);
    const starts = result.experience.map((e) => e.start);
    expect(starts).toEqual([
      '2024-06',
      '2023-01',
      '2021-08',
      '2020-03',
      '2019-01',
    ]);
  });

  it('places role-b (2024-06) before role-a (2023-01)', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(testVault, config);
    const ids = result.experience.map((e) => e.id);
    expect(ids.indexOf('role-b')).toBeLessThan(ids.indexOf('role-a'));
  });

  it('places role-a (2023-01) before role-e (2021-08)', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(testVault, config);
    const ids = result.experience.map((e) => e.id);
    expect(ids.indexOf('role-a')).toBeLessThan(ids.indexOf('role-e'));
  });

  it('places role-e (2021-08) before role-c (2020-03)', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(testVault, config);
    const ids = result.experience.map((e) => e.id);
    expect(ids.indexOf('role-e')).toBeLessThan(ids.indexOf('role-c'));
  });

  it('places role-c (2020-03) before role-d (2019-01)', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(testVault, config);
    const ids = result.experience.map((e) => e.id);
    expect(ids.indexOf('role-c')).toBeLessThan(ids.indexOf('role-d'));
  });
});

describe('when projects is undefined in config', () => {
  it('returns projects as undefined', () => {
    const config = makeConfig({ projects: undefined });
    const result = assembleResume(testVault, config);
    expect(result.projects).toBeUndefined();
  });
});

describe('when certifications is "all" in config', () => {
  it('returns all certifications from the vault', () => {
    const config = makeConfig({ certifications: 'all' });
    const result = assembleResume(testVault, config);
    expect(result.certifications).toHaveLength(2);
  });

  it('includes Cert A', () => {
    const config = makeConfig({ certifications: 'all' });
    const result = assembleResume(testVault, config);
    expect(result.certifications?.some((c) => c.name === 'Cert A')).toBe(true);
  });

  it('includes Cert B', () => {
    const config = makeConfig({ certifications: 'all' });
    const result = assembleResume(testVault, config);
    expect(result.certifications?.some((c) => c.name === 'Cert B')).toBe(true);
  });
});

describe('when filtering skills by category', () => {
  it('returns only the 2 requested skill categories', () => {
    const config = makeConfig({ skills: ['Languages', 'Cloud'] });
    const result = assembleResume(testVault, config);
    expect(result.skills).toHaveLength(2);
  });

  it('includes the Languages category', () => {
    const config = makeConfig({ skills: ['Languages', 'Cloud'] });
    const result = assembleResume(testVault, config);
    expect(result.skills?.some((s) => s.category === 'Languages')).toBe(true);
  });

  it('includes the Cloud category', () => {
    const config = makeConfig({ skills: ['Languages', 'Cloud'] });
    const result = assembleResume(testVault, config);
    expect(result.skills?.some((s) => s.category === 'Cloud')).toBe(true);
  });

  it('excludes the Tools category', () => {
    const config = makeConfig({ skills: ['Languages', 'Cloud'] });
    const result = assembleResume(testVault, config);
    expect(result.skills?.some((s) => s.category === 'Tools')).toBe(false);
  });
});

describe('when experience.expand references a non-existent ID', () => {
  it('throws an error', () => {
    const config = makeConfig({ experience: { expand: ['nonexistent-id'] } });
    expect(() => assembleResume(testVault, config)).toThrow();
  });

  it('error message contains "non-existent ID"', () => {
    const config = makeConfig({ experience: { expand: ['nonexistent-id'] } });
    expect(() => assembleResume(testVault, config)).toThrowError(
      /non-existent ID/i,
    );
  });

  it('error message mentions the bad ID', () => {
    const config = makeConfig({ experience: { expand: ['nonexistent-id'] } });
    expect(() => assembleResume(testVault, config)).toThrowError(
      'nonexistent-id',
    );
  });
});

describe('when showcases references a non-existent ID', () => {
  it('throws an error', () => {
    const config = makeConfig({ showcases: ['nonexistent'] });
    expect(() => assembleResume(testVault, config)).toThrow();
  });

  it('error message references the bad showcase ID', () => {
    const config = makeConfig({ showcases: ['nonexistent'] });
    expect(() => assembleResume(testVault, config)).toThrowError('nonexistent');
  });
});

describe('when skills references a non-existent category', () => {
  it('throws an error', () => {
    const config = makeConfig({ skills: ['Nonexistent'] });
    expect(() => assembleResume(testVault, config)).toThrow();
  });

  it('error message references the bad category name', () => {
    const config = makeConfig({ skills: ['Nonexistent'] });
    expect(() => assembleResume(testVault, config)).toThrowError('Nonexistent');
  });
});

describe('when style.accent is provided in config', () => {
  it('passes the accent color through to the result', () => {
    const config = makeConfig({ style: { accent: '#ff0000' } });
    const result = assembleResume(testVault, config);
    expect(result.style?.accent).toBe('#ff0000');
  });
});

describe('when style is omitted from config', () => {
  it('result has style as undefined', () => {
    const config = makeConfig({ style: undefined });
    const result = assembleResume(testVault, config);
    expect(result.style).toBeUndefined();
  });
});

describe('when checking vault settings are merged into result', () => {
  it('result includes name from vault.settings', () => {
    const config = makeConfig();
    const result = assembleResume(testVault, config);
    expect(result.name).toBe('Test User');
  });

  it('result includes email from vault.settings', () => {
    const config = makeConfig();
    const result = assembleResume(testVault, config);
    expect(result.email).toBe('test@example.com');
  });

  it('result includes location from vault.settings', () => {
    const config = makeConfig();
    const result = assembleResume(testVault, config);
    expect(result.location).toBe('Newfield');
  });

  it('result includes linkedin from vault.settings', () => {
    const config = makeConfig();
    const result = assembleResume(testVault, config);
    expect(result.linkedin).toBe('https://linkedin.com/in/test');
  });

  it('result includes github from vault.settings', () => {
    const config = makeConfig();
    const result = assembleResume(testVault, config);
    expect(result.github).toBe('https://github.com/test');
  });
});

describe('when configName is provided', () => {
  it('includes configName in error message for invalid experience ID', () => {
    const config = makeConfig({ experience: { expand: ['bad-id'] } });
    expect(() =>
      assembleResume(testVault, config, 'my-config.yaml'),
    ).toThrowError('my-config.yaml');
  });

  it('includes configName in error message for invalid showcase ID', () => {
    const config = makeConfig({ showcases: ['bad-showcase'] });
    expect(() =>
      assembleResume(testVault, config, 'my-config.yaml'),
    ).toThrowError('my-config.yaml');
  });

  it('includes configName in error message for invalid skill category', () => {
    const config = makeConfig({ skills: ['Bad Category'] });
    expect(() =>
      assembleResume(testVault, config, 'my-config.yaml'),
    ).toThrowError('my-config.yaml');
  });
});

describe('density controls', () => {
  const densityVault: ContentVault = {
    ...testVault,
    experience: [
      {
        id: 'role-dense',
        company: 'Dense Co',
        title: 'Engineer',
        start: '2023-01',
        narrative: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
        technologies: ['Go', 'Rust', 'Python', 'TypeScript', 'Java', 'C++'],
        sections: {
          Achievements: ['A1', 'A2', 'A3', 'A4'],
          'Leadership & Mentoring': ['L1', 'L2', 'L3'],
        },
        draft: false,
      },
      {
        id: 'role-single',
        company: 'Single Co',
        title: 'Analyst',
        start: '2022-01',
        narrative: 'Only one paragraph here.',
        sections: {},
        draft: false,
      },
    ],
  };

  describe('maxAchievements', () => {
    it('caps the Achievements section to the specified count', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'], maxAchievements: 2 },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.sections?.['Achievements']).toEqual(['A1', 'A2']);
    });

    it('does not affect non-Achievements sections', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'], maxAchievements: 2 },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.sections?.['Leadership & Mentoring']).toEqual([
        'L1',
        'L2',
        'L3',
      ]);
    });
  });

  describe('maxTechnologies', () => {
    it('caps the technologies array to the specified count', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'], maxTechnologies: 3 },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.technologies).toEqual(['Go', 'Rust', 'Python']);
    });
  });

  describe('narrative mode', () => {
    it('omits narrative when mode is "none"', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'], narrative: 'none' },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.narrative).toBeUndefined();
    });

    it('returns only the first paragraph when mode is "short" and narrative has multiple paragraphs', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'], narrative: 'short' },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.narrative).toBe('First paragraph.');
    });

    it('returns the full text when mode is "short" and narrative has a single paragraph', () => {
      const config = makeConfig({
        experience: { expand: ['role-single'], narrative: 'short' },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-single');
      expect(entry?.narrative).toBe('Only one paragraph here.');
    });

    it('returns the full narrative when no narrative mode is set', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'] },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.narrative).toBe(
        'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
      );
    });

    it('returns the full narrative when mode is "full"', () => {
      const config = makeConfig({
        experience: { expand: ['role-dense'], narrative: 'full' },
      });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.narrative).toBe(
        'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
      );
    });
  });

  describe('no density fields set', () => {
    it('preserves all Achievements bullets', () => {
      const config = makeConfig({ experience: { expand: ['role-dense'] } });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.sections?.['Achievements']).toHaveLength(4);
    });

    it('preserves all technologies', () => {
      const config = makeConfig({ experience: { expand: ['role-dense'] } });
      const result = assembleResume(densityVault, config);
      const entry = result.experience.find((e) => e.id === 'role-dense');
      expect(entry?.technologies).toHaveLength(6);
    });
  });

  describe('sectionOrder', () => {
    it('passes sectionOrder through to the assembled result', () => {
      const order = ['summary', 'experience', 'skills'] as const;
      const config = makeConfig({
        experience: { expand: [] },
        sectionOrder: [...order],
      });
      const result = assembleResume(densityVault, config);
      expect(result.sectionOrder).toEqual(order);
    });

    it('result has sectionOrder as undefined when not set in config', () => {
      const config = makeConfig({ experience: { expand: [] } });
      const result = assembleResume(densityVault, config);
      expect(result.sectionOrder).toBeUndefined();
    });
  });
});

describe('minimal entry enrichment', () => {
  const minimalVault: ContentVault = {
    ...testVault,
    experience: [
      {
        id: 'role-many-tech',
        company: 'Tech Co',
        title: 'Engineer',
        start: '2023-01',
        narrative: 'First paragraph.\n\nSecond paragraph.',
        technologies: [
          'Go',
          'Rust',
          'Python',
          'TypeScript',
          'Java',
          'C++',
          'Kotlin',
          'Swift',
          'Scala',
          'Haskell',
        ],
        sections: { Achievements: ['Built system'] },
        draft: false,
      },
      {
        id: 'role-eight-tech',
        company: 'Eight Co',
        title: 'Analyst',
        start: '2022-01',
        narrative: 'Only one paragraph here.',
        technologies: [
          'Go',
          'Rust',
          'Python',
          'TypeScript',
          'Java',
          'C++',
          'Kotlin',
          'Swift',
        ],
        sections: {},
        draft: false,
      },
      {
        id: 'role-no-narrative',
        company: 'Quiet Co',
        title: 'Intern',
        start: '2021-01',
        sections: {},
        draft: false,
      },
    ],
  };

  it('includes technologies capped at 5 by default for a non-expanded entry', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(minimalVault, config);
    const entry = result.experience.find((e) => e.id === 'role-many-tech');
    expect(entry?.technologies).toHaveLength(5);
  });

  it('respects maxTechnologies config for a non-expanded entry', () => {
    const config = makeConfig({
      experience: { expand: [], maxTechnologies: 3 },
    });
    const result = assembleResume(minimalVault, config);
    const entry = result.experience.find((e) => e.id === 'role-eight-tech');
    expect(entry?.technologies).toHaveLength(3);
  });

  it('includes only the first paragraph of narrative for a non-expanded entry', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(minimalVault, config);
    const entry = result.experience.find((e) => e.id === 'role-many-tech');
    expect(entry?.narrative).toBe('First paragraph.');
  });

  it('omits narrative when narrative mode is "none" for a non-expanded entry', () => {
    const config = makeConfig({
      experience: { expand: [], narrative: 'none' },
    });
    const result = assembleResume(minimalVault, config);
    const entry = result.experience.find((e) => e.id === 'role-many-tech');
    expect(entry?.narrative).toBeUndefined();
  });

  it('has no sections field for a non-expanded entry', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(minimalVault, config);
    const entry = result.experience.find((e) => e.id === 'role-many-tech');
    expect(entry?.sections).toBeUndefined();
  });

  it('has narrative as undefined when vault entry has no narrative', () => {
    const config = makeConfig({ experience: { expand: [] } });
    const result = assembleResume(minimalVault, config);
    const entry = result.experience.find((e) => e.id === 'role-no-narrative');
    expect(entry?.narrative).toBeUndefined();
  });
});

describe('when experience.sections filter is applied to an expanded entry', () => {
  it('includes the Achievements section in the expanded entry', () => {
    const config = makeConfig({
      experience: { expand: ['role-b'], sections: ['Achievements'] },
    });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-b');
    expect(entry?.sections?.['Achievements']).toEqual(['Led project']);
  });

  it('excludes the Leadership section when not in the sections filter', () => {
    const config = makeConfig({
      experience: { expand: ['role-b'], sections: ['Achievements'] },
    });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-b');
    expect(entry?.sections?.['Leadership']).toBeUndefined();
  });

  it('returns empty sections object when no allowed sections match', () => {
    const config = makeConfig({
      experience: { expand: ['role-b'], sections: ['NonExistentSection'] },
    });
    const result = assembleResume(testVault, config);
    const entry = result.experience.find((e) => e.id === 'role-b');
    expect(entry?.sections).toEqual({});
  });
});
