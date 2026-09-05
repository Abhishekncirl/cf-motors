/** Generate a URL-safe slug for a vehicle, e.g. "2019-toyota-corolla-hybrid-a1b2". */
export function vehicleSlug(input: {
  year: number;
  make: string;
  model: string;
  variant?: string;
  stockRef?: string;
}): string {
  const parts = [input.year, input.make, input.model, input.variant]
    .filter(Boolean)
    .join(' ');
  const base = slugify(parts);
  // Append a short stock-ref suffix to guarantee uniqueness across similar cars.
  const suffix = input.stockRef ? slugify(input.stockRef) : Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`.replace(/-+/g, '-');
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
