import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Certifications } from '@/components/templates/sections/Certifications';
import type { CertificationEntry } from '@/types';

function makeEntry(
  overrides: Partial<CertificationEntry> = {},
): CertificationEntry {
  return {
    name: 'Azure Data Engineer Associate',
    issuer: 'Quantum Cloud',
    obtained: '2023-03',
    ...overrides,
  };
}

describe('Certifications', () => {
  it('returns null when entries is empty', () => {
    const { container } = render(
      <Certifications entries={[]} heading="Certifications" />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading with aria-labelledby', () => {
    render(<Certifications entries={[makeEntry()]} heading="Certifications" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Certifications');
    expect(heading.id).toBe('certifications');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('certifications');
  });

  it('renders entry name and issuer', () => {
    render(
      <Certifications
        entries={[
          makeEntry({
            name: 'GCP Professional Data Engineer',
            issuer: 'Google',
          }),
        ]}
        heading="Certifications"
      />,
    );
    expect(screen.getByText('GCP Professional Data Engineer')).toBeDefined();
    expect(screen.getByText(/Google/)).toBeDefined();
  });

  it('renders obtained date', () => {
    render(
      <Certifications
        entries={[makeEntry({ obtained: '2023-03' })]}
        heading="Certifications"
      />,
    );
    expect(screen.getByText(/Mar 2023/)).toBeDefined();
  });

  it('renders expires date with label when present', () => {
    render(
      <Certifications
        entries={[makeEntry({ obtained: '2023-03', expires: '2026-03' })]}
        heading="Certifications"
      />,
    );
    expect(screen.getByText(/Expires Mar 2026/)).toBeDefined();
  });

  it('omits expires when absent', () => {
    const { container } = render(
      <Certifications entries={[makeEntry()]} heading="Certifications" />,
    );
    expect(container.textContent).not.toContain('Expires');
  });

  it('renders Dutch dates and "Verloopt" label with locale="nl"', () => {
    render(
      <Certifications
        entries={[makeEntry({ obtained: '2023-03', expires: '2026-03' })]}
        heading="Certificeringen"
        locale="nl"
      />,
    );
    expect(screen.getByText(/mrt 2023/)).toBeDefined();
    expect(screen.getByText(/Verloopt mrt 2026/)).toBeDefined();
  });

  it('uses Dutch date format without expires in NL locale', () => {
    render(
      <Certifications
        entries={[makeEntry({ obtained: '2023-06' })]}
        heading="Certificeringen"
        locale="nl"
      />,
    );
    expect(screen.getByText(/jun 2023/)).toBeDefined();
    expect(screen.queryByText(/Verloopt/)).toBeNull();
  });
});
