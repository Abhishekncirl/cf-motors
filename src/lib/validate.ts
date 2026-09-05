/** Plain-English validators for form fields (client-side, non-technical copy). */

export function requiredText(value: string, fieldLabel: string): string | undefined {
  if (!value.trim()) return `Please enter your ${fieldLabel.toLowerCase()}.`;
  return undefined;
}

export function validEmail(value: string): string | undefined {
  if (!value.trim()) return 'Please enter your email address.';
  // Simple, forgiving pattern - just enough to catch obvious mistakes.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return 'That email address doesn’t look right. Please check it.';
  return undefined;
}

export function validPhone(value: string, required = true): string | undefined {
  const v = value.trim();
  if (!v) return required ? 'Please enter a phone number so we can call you back.' : undefined;
  if (!/^[+()\d\s-]{7,}$/.test(v)) return 'Please enter a valid phone number.';
  return undefined;
}

export function minLength(value: string, n: number, fieldLabel: string): string | undefined {
  if (value.trim().length < n) return `Please give us a little more detail in ${fieldLabel.toLowerCase()}.`;
  return undefined;
}

/** Returns true if the errors object has no defined messages. */
export function isClean(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).every((e) => !e);
}
