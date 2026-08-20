import puppeteer, { type Browser } from 'puppeteer';

declare global {
  // eslint-disable-next-line no-var
  var __BROWSER__: Browser | undefined;
}

let browserInstance: Browser | undefined = globalThis.__BROWSER__;

/**
 * Clears the cached browser instance references.
 * Called when the browser disconnects unexpectedly.
 */
function clearInstance(): void {
  browserInstance = undefined;
  globalThis.__BROWSER__ = undefined;
}

/**
 * Launches a new browser and wires up the disconnect listener.
 */
async function launchBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      // Under Docker's default AppArmor profile the crashpad handler fails to
      // start and takes the whole launch with it. A resume renderer has no use
      // for crash telemetry.
      '--disable-crash-reporter',
    ],
  });

  // Proactively clear the instance on crash so the next getBrowser() call
  // re-launches rather than returning a disconnected browser.
  browser.on('disconnected', clearInstance);

  browserInstance = browser;
  globalThis.__BROWSER__ = browser;
  return browser;
}

/**
 * Returns a singleton Puppeteer browser instance.
 *
 * Behavior:
 * - Returns the same Browser instance on repeated calls (singleton pattern)
 * - Stores browser on globalThis.__BROWSER__ for dev hot-reload compatibility
 * - Auto-recovers from crashes: disconnect listener nulls the instance so the
 *   next call re-launches instead of returning a dead browser
 * - Uses minimal Chromium args for containerized environments
 *
 * @returns A connected Puppeteer Browser instance
 */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  return launchBrowser();
}

/**
 * Closes the browser instance if it exists.
 * Used for graceful shutdown or testing cleanup.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    const instance = browserInstance;
    // Clear references before closing so the disconnect listener
    // does not double-clear if it fires during close().
    clearInstance();
    await instance.close();
  }
}
