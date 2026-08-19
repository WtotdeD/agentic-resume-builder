import { describe, it, expect } from 'vitest';
import { formatConfigTitle } from '@/lib/formatting/config';

describe('formatConfigTitle', () => {
  it('title-cases a simple name', () => {
    expect(formatConfigTitle('general')).toBe('General');
  });

  it('replaces hyphens with spaces and title-cases', () => {
    expect(formatConfigTitle('tech-lead')).toBe('Tech Lead');
  });

  it('strips .nl suffix', () => {
    expect(formatConfigTitle('general.nl')).toBe('General');
  });

  it('strips .nl suffix and formats hyphenated name', () => {
    expect(formatConfigTitle('tech-lead.nl')).toBe('Tech Lead');
  });

  it('handles multi-hyphen names', () => {
    expect(formatConfigTitle('devops-platform')).toBe('Devops Platform');
  });

  it('passes through a clean single-word name', () => {
    expect(formatConfigTitle('startup')).toBe('Startup');
  });
});
