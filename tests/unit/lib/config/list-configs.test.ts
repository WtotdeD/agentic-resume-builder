import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { listResumeConfigs } from '@/lib/config/list-configs';

const VALID_CONFIG = `title: Test Profile
summary: A test summary.
experience:
  expand:
    - test-role
`;

let dir: string | undefined;

function createTempDir(): string {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'list-configs-test-'));
  return dir;
}

afterEach(() => {
  if (dir && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    dir = undefined;
  }
});

describe('listResumeConfigs', () => {
  it('returns empty array for non-existent directory', () => {
    const result = listResumeConfigs('/tmp/does-not-exist-' + Date.now());
    expect(result).toEqual([]);
  });

  it('returns empty array for empty directory', () => {
    const d = createTempDir();
    expect(listResumeConfigs(d)).toEqual([]);
  });

  it('parses valid YAML configs with correct name', () => {
    const d = createTempDir();
    fs.writeFileSync(path.join(d, 'general.yaml'), VALID_CONFIG);

    const result = listResumeConfigs(d);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('general');
    expect(result[0]!.config.title).toBe('Test Profile');
  });

  it('ignores non-YAML files', () => {
    const d = createTempDir();
    fs.writeFileSync(path.join(d, 'general.yaml'), VALID_CONFIG);
    fs.writeFileSync(path.join(d, 'readme.md'), '# Readme');
    fs.writeFileSync(path.join(d, 'notes.txt'), 'some notes');

    const result = listResumeConfigs(d);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('general');
  });

  it('skips malformed YAML without throwing', () => {
    const d = createTempDir();
    fs.writeFileSync(path.join(d, 'bad.yaml'), 'not: valid: yaml: [[[');
    fs.writeFileSync(path.join(d, 'good.yaml'), VALID_CONFIG);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = listResumeConfigs(d);
    warn.mockRestore();

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('good');
  });

  it('returns results sorted alphabetically by filename', () => {
    const d = createTempDir();
    fs.writeFileSync(path.join(d, 'zebra.yaml'), VALID_CONFIG);
    fs.writeFileSync(path.join(d, 'alpha.yaml'), VALID_CONFIG);
    fs.writeFileSync(path.join(d, 'middle.yaml'), VALID_CONFIG);

    const result = listResumeConfigs(d);
    expect(result.map((e) => e.name)).toEqual(['alpha', 'middle', 'zebra']);
  });

  it('accepts both .yaml and .yml extensions', () => {
    const d = createTempDir();
    fs.writeFileSync(path.join(d, 'first.yaml'), VALID_CONFIG);
    fs.writeFileSync(path.join(d, 'second.yml'), VALID_CONFIG);

    const result = listResumeConfigs(d);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.name)).toEqual(['first', 'second']);
  });
});
