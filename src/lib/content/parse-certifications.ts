import { splitSections, parseKeyValues } from './parse-utils';
import { certificationEntrySchema } from '@/schemas';
import type { CertificationEntry } from '@/types';

export function parseCertifications(raw: string): CertificationEntry[] {
  const sections = splitSections(raw);
  return sections.map((section) => {
    const kv = parseKeyValues(section.content);

    return certificationEntrySchema.parse({
      name: section.heading,
      issuer: kv['issuer'],
      obtained: kv['obtained'],
      expires: kv['expires'],
      url: kv['url'],
    });
  });
}
