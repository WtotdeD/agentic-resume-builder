import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumeTemplate } from '@/components/templates/ResumeTemplate';
import type { AssembledResume } from '@/types';

function makeResume(overrides: Partial<AssembledResume> = {}): AssembledResume {
  return {
    name: 'Jane Doe',
    email: 'jane@example.com',
    location: 'Newfield, TL',
    title: 'Senior Engineer',
    summary: 'Experienced engineer with a focus on data platforms.',
    experience: [
      {
        id: 'acme-senior',
        company: 'Acme Corp',
        title: 'Senior Engineer',
        start: '2022-01',
        expanded: true,
        narrative: 'Led data platform migration.',
        sections: {
          Achievements: ['Built pipeline', 'Reduced costs by 50%'],
        },
        technologies: ['Python', 'Spark'],
      },
      {
        id: 'beta-junior',
        company: 'Beta Inc',
        title: 'Junior Engineer',
        start: '2019-06',
        end: '2021-12',
        expanded: false,
      },
    ],
    education: [
      {
        institution: 'University of Tech',
        degree: 'MSc',
        field: 'Computer Science',
        start: '2017-09',
        end: '2019-06',
      },
    ],
    ...overrides,
  };
}

describe('ResumeTemplate', () => {
  it('renders name, title, and summary', () => {
    render(<ResumeTemplate resume={makeResume()} />);

    expect(screen.getByText('Jane Doe')).toBeDefined();
    expect(
      screen.getAllByText('Senior Engineer').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText('Experienced engineer with a focus on data platforms.'),
    ).toBeDefined();
  });

  it('renders contact info', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          linkedin: 'https://linkedin.com/in/janedoe',
          github: 'https://github.com/janedoe',
        })}
      />,
    );

    expect(screen.getByText('jane@example.com')).toBeDefined();
    expect(screen.getByText('Newfield, TL')).toBeDefined();
    expect(screen.getByText('linkedin.com/in/janedoe')).toBeDefined();
    expect(screen.getByText('github.com/janedoe')).toBeDefined();
  });

  it('renders tagline when present', () => {
    render(
      <ResumeTemplate
        resume={makeResume({ tagline: 'Building robust platforms.' })}
      />,
    );
    expect(screen.getByText('Building robust platforms.')).toBeDefined();
  });

  it('does not render tagline when absent', () => {
    render(<ResumeTemplate resume={makeResume()} />);
    expect(screen.queryByText(/Building robust/)).toBeNull();
  });

  it('renders expanded experience with narrative, sections, and technologies', () => {
    render(<ResumeTemplate resume={makeResume()} />);

    expect(screen.getByText('Acme Corp')).toBeDefined();
    expect(screen.getByText('Led data platform migration.')).toBeDefined();
    expect(screen.getByText('Achievements')).toBeDefined();
    expect(screen.getByText('Built pipeline')).toBeDefined();
    expect(screen.getByText('Reduced costs by 50%')).toBeDefined();
    expect(screen.getByText('Python')).toBeDefined();
    expect(screen.getByText('Spark')).toBeDefined();
  });

  it('renders minimal experience without narrative or sections', () => {
    render(<ResumeTemplate resume={makeResume()} />);

    expect(screen.getByText('Beta Inc')).toBeDefined();
    expect(screen.queryByText('Led data platform migration.')).toBeDefined();
    const betaEntry = screen.getByText(/Beta Inc/);
    expect(betaEntry.closest('div')).toBeDefined();
  });

  it('renders education', () => {
    render(<ResumeTemplate resume={makeResume()} />);

    expect(screen.getByText('University of Tech')).toBeDefined();
    expect(screen.getByText(/MSc Computer Science/)).toBeDefined();
  });

  it('renders skills when present', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          skills: [
            { category: 'Languages', skills: ['Python', 'TypeScript'] },
            { category: 'Cloud', skills: ['Azure', 'AWS'] },
          ],
        })}
      />,
    );

    expect(screen.getByText(/Languages:/)).toBeDefined();
    expect(screen.getByText(/Python, TypeScript/)).toBeDefined();
    expect(screen.getByText(/Cloud:/)).toBeDefined();
  });

  it('does not render skills section when absent', () => {
    render(<ResumeTemplate resume={makeResume({ skills: undefined })} />);
    expect(screen.queryByText('Skills')).toBeNull();
  });

  it('renders showcases when present', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          showcases: [
            {
              id: 'my-project',
              name: 'My Project',
              repo: 'https://github.com/jane/my-project',
              summary: 'A cool project.',
              highlights: ['Fast', 'Reliable'],
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('My Project')).toBeDefined();
    expect(screen.getByText('A cool project.')).toBeDefined();
    expect(screen.getByText('Fast')).toBeDefined();
    expect(screen.getByText('Reliable')).toBeDefined();
    expect(screen.getByText('github.com/jane/my-project')).toBeDefined();
  });

  it('does not render showcases section when absent', () => {
    render(<ResumeTemplate resume={makeResume({ showcases: undefined })} />);
    expect(screen.queryByText('Showcases')).toBeNull();
  });

  it('renders certifications when present', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          certifications: [
            {
              name: 'Azure Data Engineer',
              issuer: 'Quantum Cloud',
              obtained: '2023-06',
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Azure Data Engineer')).toBeDefined();
    expect(screen.getByText(/Quantum Cloud/)).toBeDefined();
  });

  it('does not render certifications when absent', () => {
    render(
      <ResumeTemplate resume={makeResume({ certifications: undefined })} />,
    );
    expect(screen.queryByText('Certifications')).toBeNull();
  });

  it('renders projects when present', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          projects: [
            {
              name: 'Side Project',
              description: 'Something cool',
              technologies: ['Rust'],
              highlights: ['Blazing fast'],
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Side Project')).toBeDefined();
    expect(screen.getByText('Something cool')).toBeDefined();
    expect(screen.getByText('Blazing fast')).toBeDefined();
  });

  it('does not render projects when absent', () => {
    render(<ResumeTemplate resume={makeResume({ projects: undefined })} />);
    expect(screen.queryByText('Projects')).toBeNull();
  });

  it('applies accent color via CSS custom property', () => {
    const { container } = render(
      <ResumeTemplate resume={makeResume({ style: { accent: '#ff0000' } })} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--accent')).toBe('#ff0000');
  });

  it('omits inline accent when style is absent, falling back to CSS :root', () => {
    const { container } = render(
      <ResumeTemplate resume={makeResume({ style: undefined })} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--accent')).toBe('');
  });

  it('formats dates correctly', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          experience: [
            {
              id: 'test',
              company: 'Test Co',
              title: 'Engineer',
              start: '2023-03',
              end: '2024-11',
              expanded: false,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText(/Mar 2023/)).toBeDefined();
    expect(screen.getByText(/Nov 2024/)).toBeDefined();
  });

  it('shows Present for current roles', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          experience: [
            {
              id: 'current',
              company: 'Current Co',
              title: 'Lead',
              start: '2024-01',
              expanded: false,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText(/Present/)).toBeDefined();
  });

  it('renders sections in sectionOrder when provided', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          sectionOrder: ['experience', 'education'],
        })}
      />,
    );

    expect(screen.getByText('Acme Corp')).toBeDefined();
    expect(screen.getByText('University of Tech')).toBeDefined();
    expect(screen.queryByText('Summary')).toBeNull();
  });

  it('omits summary when sectionOrder is set without it', () => {
    render(
      <ResumeTemplate
        resume={makeResume({
          sectionOrder: ['experience'],
        })}
      />,
    );

    expect(screen.queryByText('Summary')).toBeNull();
    expect(
      screen.queryByText(
        'Experienced engineer with a focus on data platforms.',
      ),
    ).toBeNull();
  });

  it('renders all sections in default order when sectionOrder is absent', () => {
    render(<ResumeTemplate resume={makeResume()} />);

    expect(screen.getByText('Summary')).toBeDefined();
    expect(screen.getByText('Experience')).toBeDefined();
    expect(screen.getByText('Education')).toBeDefined();
  });
});
