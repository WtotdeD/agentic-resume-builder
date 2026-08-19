import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Education } from '@/components/templates/sections/Education';
import type { AssembledResume } from '@/types';

type EducationEntry = AssembledResume['education'][number];

function makeEntry(overrides: Partial<EducationEntry> = {}): EducationEntry {
  return {
    institution: 'Puddlemere Polytechnic',
    degree: 'MSc',
    field: 'Computer Science',
    start: '2016-09',
    ...overrides,
  };
}

describe('Education', () => {
  it('returns null when entries is empty', () => {
    const { container } = render(
      <Education entries={[]} heading="Education" />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading with aria-labelledby', () => {
    render(<Education entries={[makeEntry()]} heading="Education" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Education');
    expect(heading.id).toBe('education');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('education');
  });

  it('renders institution, degree, and field', () => {
    render(
      <Education
        entries={[
          makeEntry({
            institution: 'Puddlemere Institute',
            degree: 'BSc',
            field: 'Data Science',
          }),
        ]}
        heading="Education"
      />,
    );
    expect(screen.getByText('Puddlemere Institute')).toBeDefined();
    expect(screen.getByText(/BSc Data Science/)).toBeDefined();
  });

  it('renders start date', () => {
    render(
      <Education
        entries={[makeEntry({ start: '2016-09' })]}
        heading="Education"
      />,
    );
    expect(screen.getByText(/Sep 2016/)).toBeDefined();
  });

  it('renders end date when present', () => {
    render(
      <Education
        entries={[makeEntry({ start: '2016-09', end: '2018-07' })]}
        heading="Education"
      />,
    );
    expect(screen.getByText(/Sep 2016/)).toBeDefined();
    expect(screen.getByText(/Jul 2018/)).toBeDefined();
  });

  it('omits end date when absent', () => {
    const { container } = render(
      <Education
        entries={[makeEntry({ start: '2016-09' })]}
        heading="Education"
      />,
    );
    expect(container.textContent).toContain('Sep 2016');
    expect(container.textContent).not.toContain('–');
  });

  it('renders GPA when present', () => {
    render(
      <Education
        entries={[makeEntry({ gpa: '3.8/4.0' })]}
        heading="Education"
      />,
    );
    expect(screen.getByText(/GPA: 3.8\/4.0/)).toBeDefined();
  });

  it('omits GPA when not provided', () => {
    const { container } = render(
      <Education entries={[makeEntry()]} heading="Education" />,
    );
    expect(container.textContent).not.toContain('GPA');
  });

  it('renders honors as joined text when present', () => {
    render(
      <Education
        entries={[makeEntry({ honors: ['Cum Laude', "Dean's List"] })]}
        heading="Education"
      />,
    );
    expect(screen.getByText("Cum Laude · Dean's List")).toBeDefined();
  });

  it('omits honors when not provided', () => {
    const { container } = render(
      <Education entries={[makeEntry()]} heading="Education" />,
    );
    expect(container.textContent).not.toContain(' · ');
  });

  it('omits honors when array is empty', () => {
    const { container } = render(
      <Education entries={[makeEntry({ honors: [] })]} heading="Education" />,
    );
    expect(container.textContent).not.toContain(' · ');
  });

  it('renders dates in Dutch format with locale="nl"', () => {
    render(
      <Education
        entries={[makeEntry({ start: '2016-09', end: '2018-07' })]}
        heading="Opleiding"
        locale="nl"
      />,
    );
    expect(screen.getByText(/sep 2016/)).toBeDefined();
    expect(screen.getByText(/jul 2018/)).toBeDefined();
  });
});
