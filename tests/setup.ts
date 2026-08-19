import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Ensure DOM is ready before each test
beforeEach(() => {
  if (!document.body) {
    document.body = document.createElement('body');
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
