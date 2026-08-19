import { describe, it, expect } from 'vitest';
import {
  splitFrontmatter,
  splitSections,
  splitSubsections,
  parseKeyValues,
  parseBullets,
} from '@/lib/content/parse-utils';

describe('splitFrontmatter', () => {
  it('extracts frontmatter and body from valid input', () => {
    const raw = '---\ntitle: Test\ndate: 2024-01\n---\nBody content here.';
    const result = splitFrontmatter(raw);
    expect(result.frontmatter).toBe('title: Test\ndate: 2024-01');
    expect(result.body).toBe('Body content here.');
  });

  it('returns empty frontmatter when delimiters are missing', () => {
    const raw = 'Just a body with no frontmatter.';
    const result = splitFrontmatter(raw);
    expect(result.frontmatter).toBe('');
    expect(result.body).toBe(raw);
  });

  it('handles Windows \\r\\n line endings', () => {
    const raw = '---\r\ntitle: Test\r\n---\r\nBody content.';
    const result = splitFrontmatter(raw);
    expect(result.frontmatter).toBe('title: Test');
    expect(result.body).toBe('Body content.');
  });

  it('returns empty frontmatter and body for empty string', () => {
    const result = splitFrontmatter('');
    expect(result.frontmatter).toBe('');
    expect(result.body).toBe('');
  });
});

describe('splitSections', () => {
  it('splits multiple sections with content', () => {
    const body = '## Experience\nWorked at Acme.\n## Education\nStudied CS.';
    const sections = splitSections(body);
    expect(sections).toHaveLength(2);
    expect(sections[0]!.heading).toBe('Experience');
    expect(sections[0]!.content).toBe('Worked at Acme.\n');
    expect(sections[1]!.heading).toBe('Education');
    expect(sections[1]!.content).toBe('Studied CS.');
  });

  it('handles heading-only section with no content', () => {
    const body = '## Skills';
    const sections = splitSections(body);
    expect(sections).toHaveLength(1);
    expect(sections[0]!.heading).toBe('Skills');
    expect(sections[0]!.content).toBe('');
  });

  it('returns empty array for empty string', () => {
    expect(splitSections('')).toEqual([]);
  });

  it('captures preamble text before first ## as a section', () => {
    const body = 'Preamble text\n## Section One\nContent.';
    const sections = splitSections(body);
    expect(sections).toHaveLength(2);
    expect(sections[0]!.heading).toBe('Preamble text');
    expect(sections[1]!.heading).toBe('Section One');
  });
});

describe('splitSubsections', () => {
  it('splits multiple subsections with content', () => {
    const content = '### Achievements\n- Built pipeline\n### Tools\nPython';
    const subs = splitSubsections(content);
    expect(subs).toHaveLength(2);
    expect(subs[0]!.heading).toBe('Achievements');
    expect(subs[0]!.content).toBe('- Built pipeline\n');
    expect(subs[1]!.heading).toBe('Tools');
    expect(subs[1]!.content).toBe('Python');
  });

  it('handles heading-only subsection', () => {
    const content = '### Empty';
    const subs = splitSubsections(content);
    expect(subs).toHaveLength(1);
    expect(subs[0]!.heading).toBe('Empty');
    expect(subs[0]!.content).toBe('');
  });

  it('returns empty array for empty string', () => {
    expect(splitSubsections('')).toEqual([]);
  });
});

describe('parseKeyValues', () => {
  it('parses standard key-value pairs', () => {
    const text = 'company: Acme Corp\ntitle: Senior Engineer';
    const kv = parseKeyValues(text);
    expect(kv).toEqual({ company: 'Acme Corp', title: 'Senior Engineer' });
  });

  it('preserves colons in values', () => {
    const text = 'url: https://example.com:8080/path';
    const kv = parseKeyValues(text);
    expect(kv).toEqual({ url: 'https://example.com:8080/path' });
  });

  it('skips lines starting with - or #', () => {
    const text = 'key: value\n- bullet item\n# comment\nother: data';
    const kv = parseKeyValues(text);
    expect(kv).toEqual({ key: 'value', other: 'data' });
  });

  it('returns empty object for empty string', () => {
    expect(parseKeyValues('')).toEqual({});
  });

  it('skips lines without colons', () => {
    const text = 'no colon here\nkey: value';
    const kv = parseKeyValues(text);
    expect(kv).toEqual({ key: 'value' });
  });
});

describe('parseBullets', () => {
  it('extracts bullet items', () => {
    const text = '- Item one\n- Item two\n- Item three';
    expect(parseBullets(text)).toEqual(['Item one', 'Item two', 'Item three']);
  });

  it('handles indented bullets', () => {
    const text = '  - Indented item\n    - Deeply indented';
    expect(parseBullets(text)).toEqual(['Indented item', 'Deeply indented']);
  });

  it('filters out empty bullet items', () => {
    const text = '- Valid\n- \n- Also valid';
    expect(parseBullets(text)).toEqual(['Valid', 'Also valid']);
  });

  it('skips non-bullet lines', () => {
    const text = 'Plain text\n- Bullet\nMore text\n- Another';
    expect(parseBullets(text)).toEqual(['Bullet', 'Another']);
  });

  it('returns empty array for empty string', () => {
    expect(parseBullets('')).toEqual([]);
  });
});
