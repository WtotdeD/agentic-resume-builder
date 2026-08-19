import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, it, expect, afterEach } from 'vitest';
import { loadContentVault } from '@/lib/content/vault';

const VALID_SETTINGS = `name: Test User
email: test@example.com
`;

const VALID_EXPERIENCE = `---
id: test-role
company: Test Corp
title: Engineer
start: 2022-01
---

A role narrative.

## Achievements

- First achievement
`;

const VALID_EDUCATION = `## Test University — MSc Computer Science
start: 2018-09
end: 2020-06
`;

const VALID_SKILLS = `## Programming
Python, TypeScript
`;

const VALID_CERTIFICATIONS = `## Test Cert
issuer: Test Issuer
obtained: 2023-06
`;

const VALID_SHOWCASES = `## Test Project
id: test-project
repo: https://github.com/test/repo

A showcase summary.

### Highlights

- First highlight
`;

const VALID_PROJECTS = `## Side Project
description: A side project I built for fun.
`;

let tmpDirs: string[] = [];

function makeTempVault(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-test-'));
  tmpDirs.push(dir);

  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tmpDirs = [];
});

describe('when loading a vault with all valid content files', () => {
  it('returns a ContentVault with all sections populated', () => {
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/2022-01-test-role.md': VALID_EXPERIENCE,
      'education.md': VALID_EDUCATION,
      'skills.md': VALID_SKILLS,
      'certifications.md': VALID_CERTIFICATIONS,
      'showcases.md': VALID_SHOWCASES,
      'projects.md': VALID_PROJECTS,
    });

    const vault = loadContentVault(dir);

    expect(vault.settings.name).toBe('Test User');
    expect(vault.settings.email).toBe('test@example.com');
    expect(vault.experience).toHaveLength(1);
    expect(vault.education).toHaveLength(1);
    expect(vault.skills).toHaveLength(1);
    expect(vault.certifications).toHaveLength(1);
    expect(vault.showcases).toHaveLength(1);
    expect(vault.projects).toHaveLength(1);
  });

  it('parses experience entry correctly', () => {
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/test-role.md': VALID_EXPERIENCE,
    });

    const vault = loadContentVault(dir);
    const entry = vault.experience[0]!;
    expect(entry.id).toBe('test-role');
    expect(entry.company).toBe('Test Corp');
    expect(entry.title).toBe('Engineer');
  });

  it('parses education entry correctly', () => {
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'education.md': VALID_EDUCATION,
    });

    const vault = loadContentVault(dir);
    expect(vault.education[0]!.institution).toBe('Test University');
    expect(vault.education[0]!.degree).toBe('MSc');
  });

  it('parses showcase entry correctly', () => {
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'showcases.md': VALID_SHOWCASES,
    });

    const vault = loadContentVault(dir);
    expect(vault.showcases[0]!.id).toBe('test-project');
    expect(vault.showcases[0]!.summary).toBe('A showcase summary.');
  });
});

describe('when optional content files are absent', () => {
  it('returns empty arrays for absent sections', () => {
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toEqual([]);
    expect(vault.education).toEqual([]);
    expect(vault.skills).toEqual([]);
    expect(vault.projects).toEqual([]);
    expect(vault.showcases).toEqual([]);
    expect(vault.certifications).toEqual([]);
  });
});

describe('when the experience directory has draft entries', () => {
  it('excludes draft entries from the returned experience array', () => {
    const draftExperience = `---
id: draft-role
company: Draft Corp
title: Engineer
start: 2019-01
draft: true
---
A narrative.
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/published.md': VALID_EXPERIENCE,
      'experience/draft.md': draftExperience,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toHaveLength(1);
    expect(vault.experience[0]!.id).toBe('test-role');
  });

  it('returns an empty experience array when all entries are drafts', () => {
    const draftExperience = `---
id: draft-role
company: Draft Corp
title: Engineer
start: 2019-01
draft: true
---
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/draft.md': draftExperience,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toEqual([]);
  });
});

describe('when the experience directory has locale-suffixed files', () => {
  it('excludes *.nl.md files from the loaded experience', () => {
    const nlEntry = `---
id: test-role
company: Test Corp
title: Engineer
start: 2022-01
---
Een rol beschrijving.
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/test-role.md': VALID_EXPERIENCE,
      'experience/test-role.nl.md': nlEntry,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toHaveLength(1);
    expect(vault.experience[0]!.id).toBe('test-role');
  });

  it('excludes any multi-extension .md files (e.g., .fr.md)', () => {
    const frEntry = `---
id: test-role-fr
company: Test Corp
title: Ingénieur
start: 2022-01
---
Un récit de rôle.
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/test-role.md': VALID_EXPERIENCE,
      'experience/test-role.fr.md': frEntry,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toHaveLength(1);
    expect(vault.experience[0]!.id).toBe('test-role');
  });
});

describe('when the experience directory has duplicate IDs', () => {
  it('throws with a message identifying the duplicate ID', () => {
    const secondEntry = `---
id: test-role
company: Other Corp
title: Engineer
start: 2023-01
---
A different narrative.
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/first.md': VALID_EXPERIENCE,
      'experience/second.md': secondEntry,
    });

    expect(() => loadContentVault(dir)).toThrow('test-role');
  });
});

describe('when the showcases file has duplicate IDs', () => {
  it('throws with a message identifying the duplicate ID', () => {
    const duplicateShowcases = `## First Project
id: test-project
repo: https://github.com/test/first

First summary.

## Second Project
id: test-project
repo: https://github.com/test/second

Second summary.
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'showcases.md': duplicateShowcases,
    });

    expect(() => loadContentVault(dir)).toThrow('test-project');
  });
});

describe('when the settings file has missing required fields', () => {
  it('throws a descriptive error when name is missing', () => {
    const dir = makeTempVault({
      'settings.yaml': 'email: test@example.com\n',
    });

    expect(() => loadContentVault(dir)).toThrow();
  });

  it('throws a descriptive error when email is missing', () => {
    const dir = makeTempVault({
      'settings.yaml': 'name: Test User\n',
    });

    expect(() => loadContentVault(dir)).toThrow();
  });

  it('throws when settings.yaml has an invalid email', () => {
    const dir = makeTempVault({
      'settings.yaml': 'name: Test User\nemail: not-an-email\n',
    });

    expect(() => loadContentVault(dir)).toThrow();
  });
});

describe('when an experience file has missing required frontmatter', () => {
  it('throws with the filename in the error message', () => {
    const invalidExperience = `---
company: No ID Corp
title: Engineer
start: 2022-01
---
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/no-id.md': invalidExperience,
    });

    expect(() => loadContentVault(dir)).toThrow('no-id.md');
  });
});

describe('when the experience directory does not exist', () => {
  it('returns an empty experience array', () => {
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toEqual([]);
  });
});

describe('when multiple experience files exist', () => {
  it('loads all non-draft entries sorted by filename', () => {
    const roleB = `---
id: role-b
company: B Corp
title: Senior Engineer
start: 2023-01
---
Role B narrative.
`;
    const roleC = `---
id: role-c
company: C Corp
title: Staff Engineer
start: 2024-01
---
Role C narrative.
`;
    const dir = makeTempVault({
      'settings.yaml': VALID_SETTINGS,
      'experience/a-role.md': VALID_EXPERIENCE,
      'experience/b-role.md': roleB,
      'experience/c-role.md': roleC,
    });

    const vault = loadContentVault(dir);
    expect(vault.experience).toHaveLength(3);
    const ids = vault.experience.map((e) => e.id);
    expect(ids).toContain('test-role');
    expect(ids).toContain('role-b');
    expect(ids).toContain('role-c');
  });
});
