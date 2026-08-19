import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skills } from '@/components/templates/sections/Skills';
import type { SkillCategory } from '@/types';

function makeCategory(overrides: Partial<SkillCategory> = {}): SkillCategory {
  return {
    category: 'Cloud & Infrastructure',
    skills: ['Azure', 'Databricks', 'Terraform'],
    ...overrides,
  };
}

describe('Skills', () => {
  it('returns null when categories is empty', () => {
    const { container } = render(<Skills categories={[]} heading="Skills" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading with aria-labelledby', () => {
    render(<Skills categories={[makeCategory()]} heading="Skills" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Skills');
    expect(heading.id).toBe('skills');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('skills');
  });

  it('renders category name', () => {
    render(
      <Skills
        categories={[makeCategory({ category: 'Data Engineering' })]}
        heading="Skills"
      />,
    );
    expect(screen.getByText(/Data Engineering/)).toBeDefined();
  });

  it('renders skills joined by comma', () => {
    render(
      <Skills
        categories={[makeCategory({ skills: ['Python', 'TypeScript', 'SQL'] })]}
        heading="Skills"
      />,
    );
    expect(screen.getByText('Python, TypeScript, SQL')).toBeDefined();
  });

  it('renders a single skill without comma', () => {
    render(
      <Skills
        categories={[makeCategory({ skills: ['Python'] })]}
        heading="Skills"
      />,
    );
    expect(screen.getByText('Python')).toBeDefined();
  });

  it('renders multiple categories as separate entries', () => {
    render(
      <Skills
        categories={[
          makeCategory({ category: 'Languages', skills: ['Python', 'SQL'] }),
          makeCategory({
            category: 'Cloud',
            skills: ['Azure', 'GCP'],
          }),
        ]}
        heading="Skills"
      />,
    );
    expect(screen.getByText(/Languages/)).toBeDefined();
    expect(screen.getByText('Python, SQL')).toBeDefined();
    expect(screen.getByText(/Cloud/)).toBeDefined();
    expect(screen.getByText('Azure, GCP')).toBeDefined();
  });

  it('derives sectionId from multi-word heading', () => {
    render(<Skills categories={[makeCategory()]} heading="Technical Skills" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('technical-skills');

    const section = heading.closest('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('technical-skills');
  });
});
