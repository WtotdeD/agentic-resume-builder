import { describe, it, expect } from 'vitest';
import { parseEducation } from '@/lib/content/parse-education';
import type { EducationEntry } from '@/types';

const TWO_ENTRIES_RAW = `## University of Lower Puddlemere — MSc Computer Science
start: 2020-09
end: 2022-06
gpa: 8.5/10
honors: Cum Laude | Valedictorian

## Northbridge University — BSc Information Systems
start: 2017-09
`;

describe('when parsing a file with multiple education entries', () => {
  it('returns an array with one entry per ## section', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result).toHaveLength(2);
  });

  it('maps the institution from the heading (before —)', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[0]!.institution).toBe('University of Lower Puddlemere');
    expect(result[1]!.institution).toBe('Northbridge University');
  });

  it('maps the degree from the first word after —', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[0]!.degree).toBe('MSc');
    expect(result[1]!.degree).toBe('BSc');
  });

  it('maps the field from the remaining words after the degree', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[0]!.field).toBe('Computer Science');
    expect(result[1]!.field).toBe('Information Systems');
  });

  it('maps start and end dates from key-values', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[0]!.start).toBe('2020-09');
    expect(result[0]!.end).toBe('2022-06');
  });

  it('maps gpa from key-value', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[0]!.gpa).toBe('8.5/10');
  });

  it('parses pipe-separated honors into an array', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[0]!.honors).toEqual(['Cum Laude', 'Valedictorian']);
  });

  it('leaves honors undefined when not present', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[1]!.honors).toBeUndefined();
  });

  it('leaves end undefined when not present', () => {
    const result = parseEducation(TWO_ENTRIES_RAW);
    expect(result[1]!.end).toBeUndefined();
  });
});

describe('when parsing an entry with only the required fields', () => {
  it('returns a valid EducationEntry with no optional fields', () => {
    const raw = `## Some University — PhD Physics
start: 2015-09
`;
    const result = parseEducation(raw);
    expect(result).toHaveLength(1);
    const entry = result[0] as EducationEntry;
    expect(entry.institution).toBe('Some University');
    expect(entry.degree).toBe('PhD');
    expect(entry.field).toBe('Physics');
    expect(entry.start).toBe('2015-09');
    expect(entry.end).toBeUndefined();
    expect(entry.gpa).toBeUndefined();
    expect(entry.honors).toBeUndefined();
  });
});

describe('when the heading has no degree field after the em dash', () => {
  it('returns empty string for degree and field', () => {
    const raw = `## Just Institution —
start: 2010-09
`;
    const result = parseEducation(raw);
    expect(result[0]!.degree).toBe('');
    expect(result[0]!.field).toBe('');
  });
});

describe('when a single-word degree with no field is provided', () => {
  it('returns the degree and empty field', () => {
    const raw = `## MIT — MBA
start: 2018-09
`;
    const result = parseEducation(raw);
    expect(result[0]!.degree).toBe('MBA');
    expect(result[0]!.field).toBe('');
  });
});

describe('when start date is missing', () => {
  it('throws a validation error', () => {
    const raw = `## Some University — MSc Biology
end: 2022-06
`;
    expect(() => parseEducation(raw)).toThrow();
  });
});

describe('when start date has an invalid format', () => {
  it('throws a validation error', () => {
    const raw = `## Some University — MSc Biology
start: September 2020
`;
    expect(() => parseEducation(raw)).toThrow();
  });
});
