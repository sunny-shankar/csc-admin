/** Letters, marks, spaces, dots, hyphens, apostrophes; min 2 chars after trim. */
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*[\p{L}\p{M}]$|^[\p{L}\p{M}]{2,}$/u;

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 255) return 'Name must be 255 characters or less';
  if (!NAME_REGEX.test(trimmed)) {
    return 'Use only letters, spaces, dots, hyphens, and apostrophes';
  }
  return null;
}
