import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseResumeConfig } from '@/lib/config/parse-config';
import { loadContentVault } from '@/lib/content/vault';
import { assembleResume } from '@/lib/assemble/assemble-resume';
import type { ContentVault } from '@/lib/content/vault';
import type { AssembledResume, ResumeConfig } from '@/types';

const resumesDir = path.join(process.cwd(), 'resumes');
const contentDir = path.join(process.cwd(), 'content');

// Enumerated straight off disk rather than through listResumeConfigs, which
// swallows a parse failure with console.warn. A lens this check cannot parse
// must fail the suite, not vanish from it.
function discoverLenses(): string[] {
  if (!fs.existsSync(resumesDir)) return [];
  return fs
    .readdirSync(resumesDir)
    .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
    .sort();
}

function headingsIn(record: Record<string, string[]> | undefined): string[] {
  return record ? Object.keys(record) : [];
}

const lensFiles = discoverLenses();

describe('every lens in resumes/ assembles against the real content vault', () => {
  const vault: ContentVault = loadContentVault(contentDir);

  describe.each(lensFiles)('%s', (file) => {
    const name = path.basename(file, path.extname(file));

    let config: ResumeConfig;
    let assembled: AssembledResume;

    // Both throw on a broken reference — an unparseable lens, or an expand /
    // showcases / certifications id matching nothing in the vault.
    it('parses and assembles', () => {
      const raw = fs.readFileSync(path.join(resumesDir, file), 'utf-8');
      config = parseResumeConfig(raw);
      assembled = assembleResume(vault, config, name);
      expect(assembled.experience.length).toBeGreaterThan(0);
    });

    it('renders every configured section that the expanded entries provide', () => {
      const configured = config.experience.sections;
      if (!configured) return;

      const expandedIds = new Set(config.experience.expand);
      const available = new Set(
        vault.experience
          .filter((entry) => expandedIds.has(entry.id))
          .flatMap((entry) => headingsIn(entry.sections)),
      );
      const rendered = new Set(
        assembled.experience
          .filter((entry) => entry.expanded)
          .flatMap((entry) => headingsIn(entry.sections)),
      );

      const missing = configured
        .filter((heading) => available.has(heading))
        .filter((heading) => !rendered.has(heading));

      expect(
        missing,
        `${name}: configured sections present in an expanded entry but absent from the assembled resume`,
      ).toEqual([]);
    });
  });
});
