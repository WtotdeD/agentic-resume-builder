import { describe, expect, it } from 'vitest';
import { resumeConfigSchema } from '@/schemas';

describe('resumeConfigSchema', () => {
  const valid = {
    title: 'Lead Data Engineer',
    summary: 'Builds robust data platforms.',
    experience: { expand: ['hyperion-tech-lead'] },
  };

  it('accepts minimal valid config', () => {
    expect(resumeConfigSchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts all optional fields', () => {
    const full = {
      ...valid,
      tagline: 'Building platforms that work.',
      experience: {
        expand: ['hyperion-tech-lead', 'kraken-senior-data-engineer'],
        sections: ['Achievements', 'Leadership & Mentoring'],
      },
      skills: ['Platform & Cloud', 'Data Engineering'],
      showcases: ['workflow-api'],
      certifications: 'all' as const,
      projects: ['Digital Resume'],
      style: { accent: '#2563eb' },
    };
    expect(resumeConfigSchema.parse(full)).toMatchObject(full);
  });

  it('accepts "all" for skills', () => {
    const config = { ...valid, skills: 'all' as const };
    expect(resumeConfigSchema.parse(config).skills).toBe('all');
  });

  it('accepts "all" for certifications', () => {
    const config = { ...valid, certifications: 'all' as const };
    expect(resumeConfigSchema.parse(config).certifications).toBe('all');
  });

  it('accepts "all" for projects', () => {
    const config = { ...valid, projects: 'all' as const };
    expect(resumeConfigSchema.parse(config).projects).toBe('all');
  });

  it('accepts empty array for projects (hides section)', () => {
    const config = { ...valid, projects: [] };
    expect(resumeConfigSchema.parse(config).projects).toEqual([]);
  });

  it('rejects missing title', () => {
    const { title: _, ...no } = valid;
    expect(() => resumeConfigSchema.parse(no)).toThrow();
  });

  it('rejects missing summary', () => {
    const { summary: _, ...no } = valid;
    expect(() => resumeConfigSchema.parse(no)).toThrow();
  });

  it('rejects missing experience.expand', () => {
    expect(() =>
      resumeConfigSchema.parse({ ...valid, experience: {} }),
    ).toThrow();
  });

  it('rejects invalid hex color', () => {
    expect(() =>
      resumeConfigSchema.parse({
        ...valid,
        style: { accent: 'blue' },
      }),
    ).toThrow('hex color');
  });

  it('accepts valid hex color', () => {
    const config = { ...valid, style: { accent: '#1e40af' } };
    const result = resumeConfigSchema.parse(config);
    expect(result.style?.accent).toBe('#1e40af');
  });

  it('rejects invalid value for skills (not "all" or array)', () => {
    expect(() =>
      resumeConfigSchema.parse({ ...valid, skills: 'some' }),
    ).toThrow();
  });
});
