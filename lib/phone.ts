/** Normalize to E.164 India format (+91XXXXXXXXXX) for backend auth. */
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  if (phone.startsWith('+91') && digits.length === 12) {
    return `+${digits}`;
  }

  throw new Error('Enter a valid Indian mobile number (+91XXXXXXXXXX)');
}

/** Strip +91 for display in a 10-digit input. */
export function phoneDigitsForInput(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits.slice(-10);
}
