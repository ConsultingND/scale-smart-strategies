import type { ContactInfoValue } from '../types';

export const emptyContact: ContactInfoValue = {
  firstName: '',
  lastName: '',
  email: '',
  consent: false,
  honeypot: '',
};

// Intentionally loose: catches typos like "abc" or "a@b" without rejecting valid addresses.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
