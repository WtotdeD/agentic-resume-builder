import { describe, it, expect } from 'vitest';
import { parseCertifications } from '@/lib/content/parse-certifications';
import type { CertificationEntry } from '@/types';

const TWO_CERTS_RAW = `## Quantum Certified Data Engineer Associate
issuer: Quantum Cloud
obtained: 2020-11

## QC-118: Data Engineering on Quantum Cloud
issuer: Quantum Cloud
obtained: 2019-03
expires: 2022-03
url: https://learn.quantumcloud.example/cert/qc-118
`;

describe('when parsing a file with multiple certification entries', () => {
  it('returns one CertificationEntry per ## section', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result).toHaveLength(2);
  });

  it('maps name from the ## heading', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[0]!.name).toBe('Quantum Certified Data Engineer Associate');
    expect(result[1]!.name).toBe('QC-118: Data Engineering on Quantum Cloud');
  });

  it('maps issuer from key-value', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[0]!.issuer).toBe('Quantum Cloud');
    expect(result[1]!.issuer).toBe('Quantum Cloud');
  });

  it('maps obtained date from key-value', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[0]!.obtained).toBe('2020-11');
    expect(result[1]!.obtained).toBe('2019-03');
  });

  it('maps optional expires date when present', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[1]!.expires).toBe('2022-03');
  });

  it('leaves expires undefined when not present', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[0]!.expires).toBeUndefined();
  });

  it('maps optional url when present', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[1]!.url).toBe(
      'https://learn.quantumcloud.example/cert/qc-118',
    );
  });

  it('leaves url undefined when not present', () => {
    const result = parseCertifications(TWO_CERTS_RAW);
    expect(result[0]!.url).toBeUndefined();
  });
});

describe('when parsing a single minimal certification', () => {
  it('returns a valid CertificationEntry', () => {
    const raw = `## AWS Solutions Architect
issuer: Amazon
obtained: 2022-03
`;
    const result = parseCertifications(raw);
    expect(result).toHaveLength(1);
    const entry = result[0] as CertificationEntry;
    expect(entry.name).toBe('AWS Solutions Architect');
    expect(entry.issuer).toBe('Amazon');
    expect(entry.obtained).toBe('2022-03');
  });
});

describe('when the certification has a colon in its heading', () => {
  it('preserves the full name including the colon', () => {
    const raw = `## AZ-900: Azure Fundamentals
issuer: Quantum Cloud
obtained: 2023-05
`;
    const result = parseCertifications(raw);
    expect(result[0]!.name).toBe('AZ-900: Azure Fundamentals');
  });
});

describe('when required fields are missing', () => {
  it('throws when issuer is missing', () => {
    const raw = `## Some Cert
obtained: 2023-01
`;
    expect(() => parseCertifications(raw)).toThrow();
  });

  it('throws when obtained is missing', () => {
    const raw = `## Some Cert
issuer: Some Issuer
`;
    expect(() => parseCertifications(raw)).toThrow();
  });

  it('throws when obtained has an invalid date format', () => {
    const raw = `## Some Cert
issuer: Some Issuer
obtained: January 2023
`;
    expect(() => parseCertifications(raw)).toThrow();
  });

  it('throws when expires has an invalid date format', () => {
    const raw = `## Some Cert
issuer: Some Issuer
obtained: 2023-01
expires: 2025
`;
    expect(() => parseCertifications(raw)).toThrow();
  });

  it('throws when url is not a valid URL', () => {
    const raw = `## Some Cert
issuer: Some Issuer
obtained: 2023-01
url: not-a-url
`;
    expect(() => parseCertifications(raw)).toThrow();
  });
});
