export function userInitials(name?: string): string {
  if (!name?.trim()) return 'A';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
