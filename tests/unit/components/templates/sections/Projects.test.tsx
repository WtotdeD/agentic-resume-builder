import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Projects } from '@/components/templates/sections/Projects';
import type { ProjectEntry } from '@/types';

function makeEntry(overrides: Partial<ProjectEntry> = {}): ProjectEntry {
  return {
    name: 'Data Pipeline',
    description: 'ETL pipeline for warehouse ingestion.',
    ...overrides,
  };
}

describe('Projects', () => {
  it('returns null when entries is empty', () => {
    const { container } = render(<Projects entries={[]} heading="Projects" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading with aria-labelledby', () => {
    render(<Projects entries={[makeEntry()]} heading="Projects" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Projects');
    expect(heading.id).toBe('projects');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('projects');
  });

  it('renders each entry name as an h3 heading', () => {
    render(
      <Projects
        entries={[
          makeEntry({ name: 'Pipeline A' }),
          makeEntry({ name: 'Pipeline B' }),
        ]}
        heading="Projects"
      />,
    );
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s).toHaveLength(2);
    expect(h3s[0].textContent).toBe('Pipeline A');
    expect(h3s[1].textContent).toBe('Pipeline B');
  });

  it('renders URL as a link with formatted display text when present', () => {
    render(
      <Projects
        entries={[makeEntry({ url: 'https://github.com/user/data-pipeline' })]}
        heading="Projects"
      />,
    );
    const link = screen.getByRole('link', {
      name: 'github.com/user/data-pipeline',
    });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/user/data-pipeline',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('omits link when URL is absent', () => {
    render(<Projects entries={[makeEntry()]} heading="Projects" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders description text', () => {
    render(
      <Projects
        entries={[makeEntry({ description: 'Processes 10M rows daily.' })]}
        heading="Projects"
      />,
    );
    expect(screen.getByText('Processes 10M rows daily.')).toBeDefined();
  });

  it('renders technologies as joined text when present', () => {
    render(
      <Projects
        entries={[makeEntry({ technologies: ['Python', 'Spark', 'Kafka'] })]}
        heading="Projects"
      />,
    );
    expect(screen.getByText('Python · Spark · Kafka')).toBeDefined();
  });

  it('omits technologies when not provided', () => {
    const { container } = render(
      <Projects entries={[makeEntry()]} heading="Projects" />,
    );
    expect(container.textContent).not.toContain(' · ');
  });

  it('omits technologies when array is empty', () => {
    const { container } = render(
      <Projects
        entries={[makeEntry({ technologies: [] })]}
        heading="Projects"
      />,
    );
    expect(container.textContent).not.toContain(' · ');
  });

  it('renders highlights as list items when present', () => {
    render(
      <Projects
        entries={[
          makeEntry({
            highlights: ['Reduced latency by 40%', 'Zero-downtime deploys'],
          }),
        ]}
        heading="Projects"
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('Reduced latency by 40%');
    expect(items[1].textContent).toBe('Zero-downtime deploys');
  });

  it('omits list when highlights is absent', () => {
    const { container } = render(
      <Projects entries={[makeEntry()]} heading="Projects" />,
    );
    expect(container.querySelector('ul')).toBeNull();
  });

  it('omits list when highlights is empty', () => {
    const { container } = render(
      <Projects entries={[makeEntry({ highlights: [] })]} heading="Projects" />,
    );
    expect(container.querySelector('ul')).toBeNull();
  });
});
