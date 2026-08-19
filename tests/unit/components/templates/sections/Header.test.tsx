import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/templates/sections/Header';

const requiredProps = {
  name: 'Jane Doe',
  title: 'Senior Engineer',
  email: 'jane@example.com',
};

describe('Header', () => {
  it('renders name as h1 and title', () => {
    render(<Header {...requiredProps} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Jane Doe');
    expect(screen.getByText('Senior Engineer')).toBeDefined();
  });

  describe('tagline', () => {
    it('renders tagline when provided', () => {
      render(<Header {...requiredProps} tagline="Building data platforms" />);
      expect(screen.getByText('Building data platforms')).toBeDefined();
    });

    it('omits tagline when not provided', () => {
      const { container } = render(<Header {...requiredProps} />);
      expect(container.textContent).not.toContain('Building data platforms');
    });
  });

  describe('contacts', () => {
    it('renders email as a mailto link', () => {
      render(<Header {...requiredProps} />);
      const link = screen.getByText('jane@example.com');
      expect(link.closest('a')?.getAttribute('href')).toBe(
        'mailto:jane@example.com',
      );
    });

    it('renders location as plain text without a link', () => {
      render(<Header {...requiredProps} location="Newfield, TL" />);
      const locationText = screen.getByText('Newfield, TL');
      expect(locationText.closest('a')).toBeNull();
    });

    it('omits location when not provided', () => {
      const { container } = render(<Header {...requiredProps} />);
      expect(container.textContent).not.toContain('Newfield');
    });

    it('renders LinkedIn as a formatted link', () => {
      render(
        <Header
          {...requiredProps}
          linkedin="https://linkedin.com/in/janedoe"
        />,
      );
      const link = screen.getByText('linkedin.com/in/janedoe');
      const anchor = link.closest('a');
      expect(anchor?.getAttribute('href')).toBe(
        'https://linkedin.com/in/janedoe',
      );
    });

    it('renders GitHub as a formatted link', () => {
      render(<Header {...requiredProps} github="https://github.com/janedoe" />);
      const link = screen.getByText('github.com/janedoe');
      const anchor = link.closest('a');
      expect(anchor?.getAttribute('href')).toBe('https://github.com/janedoe');
    });

    it('renders website as a formatted link', () => {
      render(<Header {...requiredProps} website="https://www.janedoe.com" />);
      const link = screen.getByText('janedoe.com');
      const anchor = link.closest('a');
      expect(anchor?.getAttribute('href')).toBe('https://www.janedoe.com');
    });
  });

  describe('external link attributes', () => {
    it('sets target="_blank" and rel="noopener noreferrer" on all external links', () => {
      render(
        <Header
          {...requiredProps}
          linkedin="https://linkedin.com/in/janedoe"
          github="https://github.com/janedoe"
          website="https://www.janedoe.com"
        />,
      );
      const anchors = screen
        .getAllByRole('link')
        .filter((a) => !a.getAttribute('href')?.startsWith('mailto:'));

      expect(anchors.length).toBe(3);
      for (const anchor of anchors) {
        expect(anchor.getAttribute('target')).toBe('_blank');
        expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      }
    });
  });

  describe('photo', () => {
    it('renders img with correct src and alt when photo is provided', () => {
      render(<Header {...requiredProps} photo="/photo.jpg" />);
      const img = screen.getByRole('img');
      expect(img.getAttribute('src')).toBe('/photo.jpg');
      expect(img.getAttribute('alt')).toBe('Jane Doe');
    });

    it('uses flex layout when photo is provided', () => {
      render(<Header {...requiredProps} photo="/photo.jpg" />);
      const header = screen.getByRole('banner');
      expect(header.className).toContain('flex');
    });

    it('does not render img when photo is not provided', () => {
      render(<Header {...requiredProps} />);
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('does not use flex layout when photo is not provided', () => {
      render(<Header {...requiredProps} />);
      const header = screen.getByRole('banner');
      expect(header.className).not.toContain('flex');
    });
  });
});
