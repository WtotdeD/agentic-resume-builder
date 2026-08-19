import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Showcases } from '@/components/templates/sections/Showcases';
import type { ShowcaseEntry } from '@/types';

function makeEntry(overrides: Partial<ShowcaseEntry> = {}): ShowcaseEntry {
  return {
    id: 'digital-resume',
    name: 'Digital Resume',
    repo: 'https://github.com/user/digital-resume',
    summary: 'A resume builder with PDF export.',
    highlights: [],
    ...overrides,
  };
}

describe('Showcases', () => {
  it('returns null when entries is empty', () => {
    const { container } = render(
      <Showcases entries={[]} heading="Showcases" />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading with aria-labelledby', () => {
    render(<Showcases entries={[makeEntry()]} heading="Showcases" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Showcases');
    expect(heading.id).toBe('showcases');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('showcases');
  });

  it('renders each entry name as an h3 heading', () => {
    render(
      <Showcases
        entries={[
          makeEntry({ id: 'a', name: 'Project Alpha' }),
          makeEntry({ id: 'b', name: 'Project Beta' }),
        ]}
        heading="Showcases"
      />,
    );
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s).toHaveLength(2);
    expect(h3s[0].textContent).toBe('Project Alpha');
    expect(h3s[1].textContent).toBe('Project Beta');
  });

  it('renders repo URL as a link with formatted display text', () => {
    render(
      <Showcases
        entries={[makeEntry({ repo: 'https://github.com/user/my-project' })]}
        heading="Showcases"
      />,
    );
    const link = screen.getByRole('link', {
      name: 'github.com/user/my-project',
    });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/user/my-project',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders technologies as tags when present', () => {
    render(
      <Showcases
        entries={[
          makeEntry({ technologies: ['TypeScript', 'React', 'Tailwind'] }),
        ]}
        heading="Showcases"
      />,
    );
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Tailwind')).toBeDefined();
  });

  it('omits technologies when not provided', () => {
    const { container } = render(
      <Showcases entries={[makeEntry()]} heading="Showcases" />,
    );
    const tags = container.querySelectorAll('.rounded-full');
    expect(tags).toHaveLength(0);
  });

  it('omits technologies when array is empty', () => {
    const { container } = render(
      <Showcases
        entries={[makeEntry({ technologies: [] })]}
        heading="Showcases"
      />,
    );
    const tags = container.querySelectorAll('.rounded-full');
    expect(tags).toHaveLength(0);
  });

  it('renders summary text', () => {
    render(
      <Showcases
        entries={[makeEntry({ summary: 'Builds PDFs from markdown.' })]}
        heading="Showcases"
      />,
    );
    expect(screen.getByText('Builds PDFs from markdown.')).toBeDefined();
  });

  it('renders highlights as list items when present', () => {
    render(
      <Showcases
        entries={[
          makeEntry({
            highlights: ['Puppeteer PDF export', 'WCAG AA compliant'],
          }),
        ]}
        heading="Showcases"
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('Puppeteer PDF export');
    expect(items[1].textContent).toBe('WCAG AA compliant');
  });

  it('omits list when highlights is empty', () => {
    const { container } = render(
      <Showcases
        entries={[makeEntry({ highlights: [] })]}
        heading="Showcases"
      />,
    );
    expect(container.querySelector('ul')).toBeNull();
  });
});
