/**
 * T063: Browser Pool Singleton Tests
 *
 * Tests for the browser pool singleton that manages Puppeteer browser lifecycle.
 * These tests verify singleton pattern, browser creation, page generation, and
 * recovery from disconnect.
 *
 * RED phase: Tests fail because src/lib/pdf/browser-pool.ts doesn't exist yet.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, Page } from 'puppeteer';

// Mock puppeteer module
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(),
  },
}));

describe('when getting browser instance', () => {
  let mockBrowser: Browser;
  let mockPage: Page;

  beforeEach(async () => {
    // Clear module cache to reset singleton between tests
    vi.resetModules();
    vi.clearAllMocks();

    // Create mock page
    mockPage = {
      goto: vi.fn(),
      pdf: vi.fn(),
      close: vi.fn(),
      evaluateOnNewDocument: vi.fn(),
    } as unknown as Page;

    // Create mock browser
    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      isConnected: vi.fn().mockReturnValue(true),
      close: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    } as unknown as Browser;

    // Mock puppeteer.launch
    const puppeteer = await import('puppeteer');
    vi.mocked(puppeteer.default.launch).mockResolvedValue(mockBrowser);

    // Clear globalThis browser
    delete (globalThis as { __BROWSER__?: Browser }).__BROWSER__;
  });

  it('returns a Browser instance', async () => {
    const { getBrowser } = await import('@/lib/pdf/browser-pool');
    const browser = await getBrowser();

    expect(browser).toBeDefined();
    expect(browser).toBe(mockBrowser);
  });

  it('returns the same instance on subsequent calls', async () => {
    const { getBrowser } = await import('@/lib/pdf/browser-pool');

    const browser1 = await getBrowser();
    const browser2 = await getBrowser();

    expect(browser1).toBe(browser2);

    const puppeteer = await import('puppeteer');
    // Should only launch once despite two calls
    expect(vi.mocked(puppeteer.default.launch)).toHaveBeenCalledTimes(1);
  });

  it('creates a new page via browser.newPage()', async () => {
    const { getBrowser } = await import('@/lib/pdf/browser-pool');
    const browser = await getBrowser();
    const page = await browser.newPage();

    expect(page).toBeDefined();
    expect(page).toBe(mockPage);
    expect(vi.mocked(browser.newPage)).toHaveBeenCalledTimes(1);
  });

  it('creates new browser after disconnect', async () => {
    const { getBrowser } = await import('@/lib/pdf/browser-pool');
    const puppeteer = await import('puppeteer');

    // First call - connected browser
    const browser1 = await getBrowser();
    expect(browser1).toBe(mockBrowser);

    // Simulate disconnect
    vi.mocked(browser1.isConnected).mockReturnValue(false);

    // Create new mock browser for reconnection
    const newMockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      isConnected: vi.fn().mockReturnValue(true),
      close: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    } as unknown as Browser;
    vi.mocked(puppeteer.default.launch).mockResolvedValue(newMockBrowser);

    // Second call - should detect disconnect and create new browser
    const browser2 = await getBrowser();
    expect(browser2).toBe(newMockBrowser);
    expect(browser2).not.toBe(browser1);

    // Should have launched twice (initial + after disconnect)
    expect(vi.mocked(puppeteer.default.launch)).toHaveBeenCalledTimes(2);
  });

  it('stores browser on globalThis for dev hot-reload', async () => {
    const { getBrowser } = await import('@/lib/pdf/browser-pool');
    const browser = await getBrowser();

    expect((globalThis as { __BROWSER__?: Browser }).__BROWSER__).toBe(browser);
  });
});
