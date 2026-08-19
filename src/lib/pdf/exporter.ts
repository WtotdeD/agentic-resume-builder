import { getBrowser } from './browser-pool';

export async function generatePdf(
  configName: string,
  baseUrl: string,
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  try {
    const renderUrl = `${baseUrl}/render/${encodeURIComponent(configName)}`;
    await page.goto(renderUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    try {
      await Promise.race([
        page.evaluate(() => document.fonts.ready),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Font loading timeout')), 5000),
        ),
      ]);
    } catch (error) {
      console.warn('Font loading timed out or failed:', error);
    }

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '0', bottom: '15mm', left: '0' },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    page.close().catch((err: unknown) => {
      console.warn('Failed to close Puppeteer page:', err);
    });
  }
}
