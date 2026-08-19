import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Experience } from '@/components/templates/sections/Experience';
import type { AssembledResume } from '@/types';

type ExperienceEntry = AssembledResume['experience'][number];

function makeExpanded(
  overrides: Partial<ExperienceEntry> = {},
): ExperienceEntry {
  return {
    id: 'acme-lead',
    company: 'Acme Corp',
    title: 'Lead Engineer',
    start: '2022-01',
    expanded: true,
    ...overrides,
  };
}

function makeMinimal(
  overrides: Partial<ExperienceEntry> = {},
): ExperienceEntry {
  return {
    id: 'beta-dev',
    company: 'Beta Inc',
    title: 'Developer',
    start: '2019-06',
    end: '2021-12',
    expanded: false,
    ...overrides,
  };
}

describe('Experience', () => {
  it('returns null when entries is empty', () => {
    const { container } = render(
      <Experience entries={[]} heading="Experience" />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading with aria-labelledby', () => {
    render(<Experience entries={[makeMinimal()]} heading="Experience" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Experience');
    expect(heading.id).toBe('experience');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('experience');
  });

  describe('expanded entry', () => {
    it('renders company, title, and date range', () => {
      render(<Experience entries={[makeExpanded()]} heading="Experience" />);
      expect(screen.getByText('Acme Corp')).toBeDefined();
      expect(screen.getByText(/Lead Engineer/)).toBeDefined();
      expect(screen.getByText(/Jan 2022/)).toBeDefined();
      expect(screen.getByText(/Present/)).toBeDefined();
    });

    it('renders technologies as badges', () => {
      render(
        <Experience
          entries={[
            makeExpanded({ technologies: ['Python', 'Spark', 'Kafka'] }),
          ]}
          heading="Experience"
        />,
      );
      expect(screen.getByText('Python')).toBeDefined();
      expect(screen.getByText('Spark')).toBeDefined();
      expect(screen.getByText('Kafka')).toBeDefined();
    });

    it('renders narrative paragraphs', () => {
      render(
        <Experience
          entries={[
            makeExpanded({
              narrative: 'First paragraph.\n\nSecond paragraph.',
            }),
          ]}
          heading="Experience"
        />,
      );
      expect(screen.getByText('First paragraph.')).toBeDefined();
      expect(screen.getByText('Second paragraph.')).toBeDefined();
    });

    it('renders section headings and bullets', () => {
      render(
        <Experience
          entries={[
            makeExpanded({
              sections: {
                Achievements: ['Built pipeline', 'Reduced costs by 50%'],
              },
            }),
          ]}
          heading="Experience"
        />,
      );
      expect(screen.getByText('Achievements')).toBeDefined();
      expect(screen.getByText('Built pipeline')).toBeDefined();
      expect(screen.getByText('Reduced costs by 50%')).toBeDefined();
    });

    it('renders location when provided', () => {
      render(
        <Experience
          entries={[makeExpanded({ location: 'Newfield, TL' })]}
          heading="Experience"
        />,
      );
      expect(screen.getByText(/Newfield, TL/)).toBeDefined();
    });

    it('omits location when not provided', () => {
      const { container } = render(
        <Experience entries={[makeExpanded()]} heading="Experience" />,
      );
      expect(container.textContent).not.toContain('Newfield');
    });

    it('shows "Heden" for ongoing role in NL locale', () => {
      render(
        <Experience
          entries={[makeExpanded()]}
          heading="Werkervaring"
          locale="nl"
        />,
      );
      expect(screen.getByText(/Heden/)).toBeDefined();
    });

    it('shows end date when role has ended', () => {
      render(
        <Experience
          entries={[makeExpanded({ end: '2024-06' })]}
          heading="Experience"
        />,
      );
      expect(screen.getByText(/Jun 2024/)).toBeDefined();
      expect(screen.queryByText(/Present/)).toBeNull();
    });
  });

  describe('minimal entry', () => {
    it('renders company, title, and date range', () => {
      render(<Experience entries={[makeMinimal()]} heading="Experience" />);
      expect(screen.getByText('Beta Inc')).toBeDefined();
      expect(screen.getByText(/Developer/)).toBeDefined();
      expect(screen.getByText(/Jun 2019/)).toBeDefined();
      expect(screen.getByText(/Dec 2021/)).toBeDefined();
    });

    it('renders location when provided', () => {
      render(
        <Experience
          entries={[makeMinimal({ location: 'Springvale' })]}
          heading="Experience"
        />,
      );
      expect(screen.getByText(/Springvale/)).toBeDefined();
    });

    it('omits location when not provided', () => {
      const { container } = render(
        <Experience entries={[makeMinimal()]} heading="Experience" />,
      );
      expect(container.textContent).not.toContain('Springvale');
    });

    it('shows "Present" for ongoing role in EN locale', () => {
      render(
        <Experience
          entries={[makeMinimal({ end: undefined })]}
          heading="Experience"
        />,
      );
      expect(screen.getByText(/Present/)).toBeDefined();
    });

    it('shows "Heden" for ongoing role in NL locale', () => {
      render(
        <Experience
          entries={[makeMinimal({ end: undefined })]}
          heading="Werkervaring"
          locale="nl"
        />,
      );
      expect(screen.getByText(/Heden/)).toBeDefined();
    });
  });
});
