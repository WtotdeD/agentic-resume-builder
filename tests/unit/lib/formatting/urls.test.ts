import { describe, it, expect } from 'vitest';
import { formatUrl } from '@/lib/formatting/urls';

describe('formatUrl', () => {
  it('strips https:// prefix', () => {
    expect(formatUrl('https://github.com/user')).toBe('github.com/user');
  });

  it('strips http:// prefix', () => {
    expect(formatUrl('http://example.com/path')).toBe('example.com/path');
  });

  it('strips https://www. prefix', () => {
    expect(formatUrl('https://www.linkedin.com/in/user')).toBe(
      'linkedin.com/in/user',
    );
  });

  it('strips http://www. prefix', () => {
    expect(formatUrl('http://www.example.com')).toBe('example.com');
  });

  it('strips trailing slash', () => {
    expect(formatUrl('https://example.com/')).toBe('example.com');
  });

  it('strips protocol + www + trailing slash combined', () => {
    expect(formatUrl('https://www.example.com/')).toBe('example.com');
  });

  it('preserves path segments', () => {
    expect(formatUrl('https://github.com/user/repo')).toBe(
      'github.com/user/repo',
    );
  });

  it('passes through already-clean URLs unchanged', () => {
    expect(formatUrl('github.com/user/repo')).toBe('github.com/user/repo');
  });

  it('strips only trailing slash, not path slashes', () => {
    expect(formatUrl('https://example.com/a/b/c/')).toBe('example.com/a/b/c');
  });
});
