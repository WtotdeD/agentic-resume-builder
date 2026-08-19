export type Section = {
  heading: string;
  content: string;
};

export function splitFrontmatter(raw: string): {
  frontmatter: string;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: '', body: raw };
  }
  return {
    frontmatter: match[1] ?? '',
    body: match[2] ?? '',
  };
}

export function splitSections(body: string): Section[] {
  const sections: Section[] = [];
  const parts = body.split(/^## /m);

  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) {
      sections.push({ heading: part.trim(), content: '' });
      continue;
    }
    const heading = part.slice(0, newlineIdx).trim();
    const content = part.slice(newlineIdx + 1);
    sections.push({ heading, content });
  }

  return sections;
}

export function splitSubsections(content: string): Section[] {
  const subsections: Section[] = [];
  const parts = content.split(/^### /m);

  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) {
      subsections.push({ heading: part.trim(), content: '' });
      continue;
    }
    const heading = part.slice(0, newlineIdx).trim();
    const body = part.slice(newlineIdx + 1);
    subsections.push({ heading, content: body });
  }

  return subsections;
}

export function parseKeyValues(text: string): Record<string, string> {
  const kv: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('-') || trimmed.startsWith('#'))
      continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (key) kv[key] = value;
  }
  return kv;
}

export function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => line.trimStart().startsWith('- '))
    .map((line) => line.trimStart().slice(2).trim())
    .filter((item) => item.length > 0);
}
