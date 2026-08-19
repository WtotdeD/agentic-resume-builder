export function formatConfigTitle(name: string): string {
  return name
    .replace(/\.nl$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
