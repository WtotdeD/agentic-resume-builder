import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { parseBlockMarkdown, parseHighlight } from '@/lib/formatting/markdown';

describe('when parsing plain text', () => {
  it('returns plain text for string without markdown', () => {
    const input = 'This is plain text';
    const result = parseHighlight(input);

    expect(result).toBe(input);
  });

  it('handles empty string', () => {
    const result = parseHighlight('');

    expect(result).toBe('');
  });

  it('handles string with only whitespace', () => {
    const input = '   ';
    const result = parseHighlight(input);

    expect(result).toBe(input);
  });
});

describe('when parsing bold text', () => {
  it('parses **bold** text to React elements', () => {
    const input = 'This is **bold** text';
    const result = parseHighlight(input);

    // Result should be an array of React elements and strings
    expect(Array.isArray(result)).toBe(true);

    // Should contain text before, bold element, and text after
    const resultArray = result as Array<string | React.ReactElement>;
    expect(resultArray).toHaveLength(3);
    expect(resultArray[0]).toBe('This is ');

    // Second element should be a React element with bold content
    const boldElement = resultArray[1] as React.ReactElement;
    expect(boldElement.type).toBe('strong');
    expect(boldElement.props.children).toBe('bold');

    expect(resultArray[2]).toBe(' text');
  });

  it('parses multiple **bold** sections in one string', () => {
    const input = '**First** and **second** bold';
    const result = parseHighlight(input);

    expect(Array.isArray(result)).toBe(true);

    const resultArray = result as Array<string | React.ReactElement>;
    // Should have: strong, ' and ', strong, ' bold'
    expect(resultArray.length).toBeGreaterThan(2);

    const firstBold = resultArray.find(
      (el) =>
        typeof el === 'object' &&
        el.type === 'strong' &&
        el.props.children === 'First',
    );
    const secondBold = resultArray.find(
      (el) =>
        typeof el === 'object' &&
        el.type === 'strong' &&
        el.props.children === 'second',
    );

    expect(firstBold).toBeDefined();
    expect(secondBold).toBeDefined();
  });
});

describe('when parsing links', () => {
  it('parses [link text](url) to anchor element', () => {
    const input = 'Visit [our website](https://example.com) for more';
    const result = parseHighlight(input);

    expect(Array.isArray(result)).toBe(true);

    const resultArray = result as Array<string | React.ReactElement>;
    expect(resultArray[0]).toBe('Visit ');

    const linkElement = resultArray[1] as React.ReactElement;
    expect(linkElement.type).toBe('a');
    expect(linkElement.props.href).toBe('https://example.com');
    expect(linkElement.props.children).toBe('our website');

    expect(resultArray[2]).toBe(' for more');
  });

  it('sets target and rel attributes for external links', () => {
    const input = '[link](https://example.com)';
    const result = parseHighlight(input);

    const linkElement = (
      result as Array<string | React.ReactElement>
    )[0] as React.ReactElement;
    expect(linkElement.props.target).toBe('_blank');
    expect(linkElement.props.rel).toContain('noopener');
    expect(linkElement.props.rel).toContain('noreferrer');
  });
});

describe('when parsing mixed markdown', () => {
  it('parses mixed bold and links in one string', () => {
    const input = 'This is **bold** and [a link](https://example.com)';
    const result = parseHighlight(input);

    expect(Array.isArray(result)).toBe(true);

    const resultArray = result as Array<string | React.ReactElement>;
    expect(resultArray.length).toBeGreaterThan(3);

    const boldElement = resultArray.find(
      (el) =>
        typeof el === 'object' &&
        el.type === 'strong' &&
        el.props.children === 'bold',
    );
    const linkElement = resultArray.find(
      (el) =>
        typeof el === 'object' &&
        el.type === 'a' &&
        el.props.href === 'https://example.com',
    );

    expect(boldElement).toBeDefined();
    expect(linkElement).toBeDefined();
  });

  it('handles **bold inside [link text](url)**', () => {
    const input = '[**bold link**](https://example.com)';
    const result = parseHighlight(input);

    expect(Array.isArray(result)).toBe(true);

    const resultArray = result as Array<string | React.ReactElement>;
    const linkElement = resultArray[0] as React.ReactElement;

    expect(linkElement.type).toBe('a');
    expect(linkElement.props.href).toBe('https://example.com');

    // Children should contain a strong element
    const children = linkElement.props.children;
    expect(Array.isArray(children)).toBe(true);

    const boldInsideLink = (
      children as Array<string | React.ReactElement>
    )[0] as React.ReactElement;
    expect(boldInsideLink.type).toBe('strong');
    expect(boldInsideLink.props.children).toBe('bold link');
  });
});

describe('when parsing edge cases', () => {
  it('handles unclosed bold markers gracefully', () => {
    const input = 'This is **unclosed bold';
    const result = parseHighlight(input);

    // Should return original string if markdown is malformed
    expect(result).toBe(input);
  });

  it('handles unclosed link brackets gracefully', () => {
    const input = 'This is [unclosed link';
    const result = parseHighlight(input);

    // Should return original string if markdown is malformed
    expect(result).toBe(input);
  });

  it('handles empty bold markers', () => {
    const input = 'This has **** empty bold';
    const result = parseHighlight(input);

    // Should either skip empty markers or return original
    expect(typeof result === 'string' || Array.isArray(result)).toBe(true);
  });
});

// ─── parseBlockMarkdown (per-job-depth-and-linking R5) ────────────────────────

describe('parseBlockMarkdown', () => {
  function renderBlocks(text: string) {
    const blocks = parseBlockMarkdown(text);
    const { container } = render(<>{blocks}</>);
    return container;
  }

  it('returns an empty array for empty input', () => {
    expect(parseBlockMarkdown('')).toEqual([]);
    expect(parseBlockMarkdown('   \n  \n')).toEqual([]);
  });

  it('renders two paragraphs separated by a blank line', () => {
    const c = renderBlocks('First paragraph.\n\nSecond paragraph.');
    expect(c.querySelectorAll('p')).toHaveLength(2);
    expect(c.querySelectorAll('p')[0]?.textContent).toBe('First paragraph.');
    expect(c.querySelectorAll('p')[1]?.textContent).toBe('Second paragraph.');
  });

  it('renders three consecutive `- item` lines as one ul with three li', () => {
    const c = renderBlocks('- one\n- two\n- three');
    const uls = c.querySelectorAll('ul');
    expect(uls).toHaveLength(1);
    expect(uls[0]?.querySelectorAll('li')).toHaveLength(3);
    expect(uls[0]?.querySelectorAll('li')[0]?.textContent).toBe('one');
  });

  it('also accepts `* item` bullet syntax', () => {
    const c = renderBlocks('* alpha\n* beta');
    const uls = c.querySelectorAll('ul');
    expect(uls).toHaveLength(1);
    expect(uls[0]?.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders paragraph + list + paragraph in order', () => {
    const c = renderBlocks(
      'Intro paragraph.\n\n- item one\n- item two\n\nOutro paragraph.',
    );
    const tags = Array.from(c.children).map((el) => el.tagName);
    expect(tags).toEqual(['P', 'UL', 'P']);
  });

  it('parses inline **bold** within a paragraph', () => {
    const c = renderBlocks('A line with **bold text** in it.');
    expect(c.querySelectorAll('strong')).toHaveLength(1);
    expect(c.querySelectorAll('strong')[0]?.textContent).toBe('bold text');
  });

  it('parses inline [text](url) within a bullet item', () => {
    const c = renderBlocks('- See [docs](https://example.test/docs)');
    const link = c.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.test/docs');
    expect(link?.textContent).toBe('docs');
  });

  it('renders unsupported block (sub-heading) as a literal paragraph', () => {
    const c = renderBlocks('#### Sub heading');
    const ps = c.querySelectorAll('p');
    expect(ps).toHaveLength(1);
    expect(ps[0]?.textContent).toBe('#### Sub heading');
    // Specifically, it must NOT be rendered as an h4
    expect(c.querySelectorAll('h4')).toHaveLength(0);
  });
});
