import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, Page, PDFOptions } from 'puppeteer';

vi.mock('@/lib/pdf/browser-pool', () => ({
  getBrowser: vi.fn(),
}));

describe('when generating PDF from resume config', () => {
  let mockPage: Page;
  let capturedPdfOptions: PDFOptions | undefined;
  let capturedNavigateUrl: string | undefined;

  beforeEach(async () => {
    vi.resetModules();
    capturedPdfOptions = undefined;
    capturedNavigateUrl = undefined;

    mockPage = {
      goto: vi.fn().mockImplementation(async (url: string) => {
        capturedNavigateUrl = url;
        return null;
      }),
      pdf: vi.fn().mockImplementation(async (options: PDFOptions) => {
        capturedPdfOptions = options;
        return Buffer.from('%PDF-1.4 fake pdf content');
      }),
      close: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      setViewport: vi.fn().mockResolvedValue(undefined),
    } as unknown as Page;

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      isConnected: vi.fn().mockReturnValue(true),
      close: vi.fn(),
    } as unknown as Browser;

    const browserPool = await import('@/lib/pdf/browser-pool');
    vi.mocked(browserPool.getBrowser).mockResolvedValue(mockBrowser);
  });

  it('generates PDF buffer', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    const buffer = await generatePdf('default', 'http://localhost:3000');

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString('utf-8')).toContain('%PDF');
  });

  it('uses correct Puppeteer config (A4, printBackground, margins, preferCSSPageSize)', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    await generatePdf('default', 'http://localhost:3000');

    expect(capturedPdfOptions).toMatchObject({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '0', bottom: '15mm', left: '0' },
      preferCSSPageSize: true,
    });
  });

  it('navigates to correct render URL using config name', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    await generatePdf('corporate-tech', 'http://localhost:3000');

    expect(capturedNavigateUrl).toBe(
      'http://localhost:3000/render/corporate-tech',
    );
    expect(vi.mocked(mockPage.goto)).toHaveBeenCalledWith(
      'http://localhost:3000/render/corporate-tech',
      expect.objectContaining({ waitUntil: 'networkidle0', timeout: 30000 }),
    );
  });

  it('waits for fonts.ready', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    await generatePdf('default', 'http://localhost:3000');

    expect(vi.mocked(mockPage.evaluate)).toHaveBeenCalled();
  });

  it('sets viewport to A4 dimensions (794x1123) before navigation', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    await generatePdf('default', 'http://localhost:3000');

    expect(vi.mocked(mockPage.setViewport)).toHaveBeenCalledWith({
      width: 794,
      height: 1123,
    });

    const setViewportOrder = vi.mocked(mockPage.setViewport).mock
      .invocationCallOrder[0];
    const gotoOrder = vi.mocked(mockPage.goto).mock.invocationCallOrder[0];
    expect(setViewportOrder).toBeLessThan(gotoOrder!);
  });

  it('enforces 30s timeout on navigation', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    await generatePdf('default', 'http://localhost:3000');

    expect(vi.mocked(mockPage.goto)).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ timeout: 30000 }),
    );
  });

  it('closes page in finally block even on error', async () => {
    const { generatePdf } = await import('@/lib/pdf/exporter');

    vi.mocked(mockPage.pdf).mockRejectedValue(
      new Error('PDF generation failed'),
    );

    await expect(
      generatePdf('default', 'http://localhost:3000'),
    ).rejects.toThrow('PDF generation failed');

    expect(vi.mocked(mockPage.close)).toHaveBeenCalled();
  });
});
