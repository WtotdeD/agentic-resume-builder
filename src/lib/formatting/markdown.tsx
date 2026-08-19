import { type ReactNode } from 'react';

/**
 * Parse limited markdown in resume highlights to React elements.
 *
 * Supported markdown:
 * - **bold text** → <strong>bold text</strong>
 * - [link text](url) → <a href="url" target="_blank" rel="noopener noreferrer">link text</a>
 * - [**bold**](url) → <a href="url"><strong>bold</strong></a>
 * - Plain text → just the text string
 *
 * @param text The highlight text with optional markdown
 * @returns ReactNode (string, JSX element, or array of both)
 *
 * @example
 * parseHighlight("Built **scalable** API") // → ["Built ", <strong>scalable</strong>, " API"]
 * parseHighlight("See [docs](https://example.com)") // → ["See ", <a href="...">docs</a>]
 * parseHighlight("Plain text") // → "Plain text"
 */
export function parseHighlight(text: string): ReactNode {
  // If empty or whitespace-only, return as-is
  if (!text || text.trim() === '') {
    return text;
  }

  // Combined regex to match both **bold** and [text](url)
  // Group 1: **bold** match (captures content between **)
  // Group 2: [text](url) match (captures link text)
  // Group 3: url for the link
  const markdownPattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

  const segments: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = markdownPattern.exec(text)) !== null) {
    const matchStart = match.index;

    // Add plain text before this match
    if (matchStart > lastIndex) {
      segments.push(text.slice(lastIndex, matchStart));
    }

    // Check which pattern matched
    if (match[1] !== undefined) {
      // Bold pattern matched: **text**
      segments.push(<strong key={matchStart}>{match[1]}</strong>);
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // Link pattern matched: [text](url)
      // Parse link text for nested bold markers
      const linkText = match[2];
      const boldInLink = /^\*\*([^*]+)\*\*$/.exec(linkText);
      const children: ReactNode = boldInLink
        ? [<strong key={`${matchStart}-bold`}>{boldInLink[1]}</strong>]
        : linkText;

      segments.push(
        <a
          key={matchStart}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {children}
        </a>,
      );
    }

    lastIndex = markdownPattern.lastIndex;
  }

  // Add any remaining plain text after the last match
  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  // If no markdown was found, return the original text
  if (segments.length === 0) {
    return text;
  }

  // If only one segment and it's a string, return it directly
  if (segments.length === 1 && typeof segments[0] === 'string') {
    return segments[0];
  }

  return segments;
}

/**
 * Parse a multi-line markdown block into an array of React block elements.
 *
 * Supported block elements (per spec `specs/per-job-depth-and-linking.md` R5):
 * - Paragraphs — text separated by one or more blank lines
 * - Bullet lists — consecutive lines starting with `- ` or `* ` (followed by
 *   a space). A blank line or non-bullet line ends the list.
 *
 * Inline formatting within paragraphs and bullet items reuses
 * `parseHighlight` (`**bold**` and `[text](url)`).
 *
 * Unsupported block markdown (sub-headings `####`, blockquotes `>`, code
 * fences ` ``` `, tables `|...|`) renders as a plain paragraph with the
 * literal source visible — graceful degradation, no errors.
 *
 * Returns an empty array when input is empty / whitespace-only.
 */
export function parseBlockMarkdown(text: string): ReactNode[] {
  if (!text || text.trim() === '') return [];

  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = (): void => {
    if (currentParagraph.length === 0) return;
    const joined = currentParagraph.join(' ');
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm text-slate-700">
        {parseHighlight(joined)}
      </p>,
    );
    currentParagraph = [];
  };

  const flushList = (): void => {
    if (currentList.length === 0) return;
    const items = currentList;
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="list-inside list-disc space-y-0.5 text-sm text-slate-700"
      >
        {items.map((item, idx) => (
          <li key={idx}>{parseHighlight(item)}</li>
        ))}
      </ul>,
    );
    currentList = [];
  };

  const bulletPattern = /^[-*]\s+(.+)$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }

    const bulletMatch = bulletPattern.exec(line);
    if (bulletMatch) {
      flushParagraph();
      currentList.push(bulletMatch[1] ?? '');
      continue;
    }

    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
