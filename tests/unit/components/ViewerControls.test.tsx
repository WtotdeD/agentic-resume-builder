import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewerControls } from '@/app/viewer-controls';

const mockPush = vi.fn();
const mockExportPdf = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/useExportPdf');

import { useExportPdf } from '@/hooks/useExportPdf';

const defaultConfigs = ['tech-lead', 'tech-lead.nl', 'devops'];

describe('ViewerControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useExportPdf).mockReturnValue({
      loading: false,
      error: null,
      exportPdf: mockExportPdf,
    });
  });

  describe('profile select', () => {
    it('navigates to the selected profile when locale is EN', () => {
      render(<ViewerControls configs={defaultConfigs} selected="tech-lead" />);

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'devops' },
      });

      expect(mockPush).toHaveBeenCalledWith('?config=devops');
    });

    it('preserves the NL locale when switching profile', () => {
      render(
        <ViewerControls configs={defaultConfigs} selected="tech-lead.nl" />,
      );

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'devops' },
      });

      expect(mockPush).toHaveBeenCalledWith('?config=devops.nl');
    });
  });

  describe('locale toggle', () => {
    it('navigates to NL variant when toggling EN→NL', () => {
      render(<ViewerControls configs={defaultConfigs} selected="tech-lead" />);

      fireEvent.click(screen.getByRole('radio', { name: 'NL' }));

      expect(mockPush).toHaveBeenCalledWith('?config=tech-lead.nl');
    });

    it('navigates to base name when toggling NL→EN', () => {
      render(
        <ViewerControls configs={defaultConfigs} selected="tech-lead.nl" />,
      );

      fireEvent.click(screen.getByRole('radio', { name: 'EN' }));

      expect(mockPush).toHaveBeenCalledWith('?config=tech-lead');
    });

    it('does not navigate when clicking the already-active locale', () => {
      render(<ViewerControls configs={defaultConfigs} selected="tech-lead" />);

      fireEvent.click(screen.getByRole('radio', { name: 'EN' }));

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Export PDF button', () => {
    it('calls exportPdf with the selected config name', () => {
      render(<ViewerControls configs={defaultConfigs} selected="tech-lead" />);

      fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));

      expect(mockExportPdf).toHaveBeenCalledWith('tech-lead');
    });

    it('shows "Exporting…" text and disables the button while loading', () => {
      vi.mocked(useExportPdf).mockReturnValue({
        loading: true,
        error: null,
        exportPdf: mockExportPdf,
      });

      render(<ViewerControls configs={defaultConfigs} selected="tech-lead" />);

      const btn = screen.getByRole('button', { name: 'Exporting…' });
      expect(btn).toBeDefined();
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows the error message when export fails', () => {
      vi.mocked(useExportPdf).mockReturnValue({
        loading: false,
        error: 'PDF failed',
        exportPdf: mockExportPdf,
      });

      render(<ViewerControls configs={defaultConfigs} selected="tech-lead" />);

      expect(screen.getByText('PDF failed')).toBeDefined();
    });
  });
});
