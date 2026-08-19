import { describe, it, expect } from 'vitest';
import { parseSkills } from '@/lib/content/parse-skills';
import type { SkillCategory } from '@/types';

const COMMA_SEPARATED_RAW = `## Platform & Cloud
Databricks, Unity Catalog, Azure, Docker

## Data Engineering
PySpark, Airflow, ETL
`;

const ONE_PER_LINE_RAW = `## Languages
Python
TypeScript
Go
`;

const MIXED_RAW = `## DevOps
GitHub Actions
Terraform, CI/CD
`;

describe('when categories have comma-separated skills', () => {
  it('returns one SkillCategory per ## section', () => {
    const result = parseSkills(COMMA_SEPARATED_RAW);
    expect(result).toHaveLength(2);
  });

  it('sets the category name from the ## heading', () => {
    const result = parseSkills(COMMA_SEPARATED_RAW);
    expect(result[0]!.category).toBe('Platform & Cloud');
    expect(result[1]!.category).toBe('Data Engineering');
  });

  it('splits comma-separated values into individual skills', () => {
    const result = parseSkills(COMMA_SEPARATED_RAW);
    expect(result[0]!.skills).toEqual([
      'Databricks',
      'Unity Catalog',
      'Azure',
      'Docker',
    ]);
  });

  it('trims whitespace from each skill', () => {
    const result = parseSkills(COMMA_SEPARATED_RAW);
    result[0]!.skills.forEach((skill) => {
      expect(skill).toBe(skill.trim());
    });
  });
});

describe('when skills are listed one per line', () => {
  it('returns each line as a separate skill', () => {
    const result = parseSkills(ONE_PER_LINE_RAW);
    expect(result[0]!.skills).toEqual(['Python', 'TypeScript', 'Go']);
  });

  it('sets the category name correctly', () => {
    const result = parseSkills(ONE_PER_LINE_RAW);
    expect(result[0]!.category).toBe('Languages');
  });
});

describe('when a category mixes comma-separated lines and single-item lines', () => {
  it('flattens all entries into a single skills array', () => {
    const result = parseSkills(MIXED_RAW);
    expect(result[0]!.skills).toEqual(['GitHub Actions', 'Terraform', 'CI/CD']);
  });
});

describe('when a single category is provided', () => {
  it('returns an array with exactly one SkillCategory', () => {
    const raw = `## Tools
Docker, Kubernetes
`;
    const result = parseSkills(raw);
    expect(result).toHaveLength(1);
    const entry = result[0] as SkillCategory;
    expect(entry.category).toBe('Tools');
    expect(entry.skills).toEqual(['Docker', 'Kubernetes']);
  });
});

describe('when a category heading contains special characters', () => {
  it('preserves the full heading including & and /', () => {
    const raw = `## CI/CD & Automation
Jenkins, GitHub Actions
`;
    const result = parseSkills(raw);
    expect(result[0]!.category).toBe('CI/CD & Automation');
  });
});

describe('when the real-world skills.md content is parsed', () => {
  const REAL_SKILLS = `## Platform & Cloud
Databricks, Unity Catalog, Azure, Docker

## Data Engineering
PySpark, Airflow, ETL, Data Modeling, Data Quality

## DevOps & CI/CD
GitHub Actions, Azure DevOps, Terraform, CI/CD
`;

  it('returns three categories', () => {
    const result = parseSkills(REAL_SKILLS);
    expect(result).toHaveLength(3);
  });

  it('parses DevOps category with four skills', () => {
    const result = parseSkills(REAL_SKILLS);
    const devops = result.find((c) => c.category === 'DevOps & CI/CD');
    expect(devops?.skills).toHaveLength(4);
  });
});
