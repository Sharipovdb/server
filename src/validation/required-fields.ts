import { BadRequestError } from '../shared/errors.ts';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findFieldIgnoringCase(source: Record<string, unknown>, field: string): unknown {
  const expected = field.toLowerCase();
  const key = Object.keys(source).find((candidate) => candidate.toLowerCase() === expected);

  return key === undefined ? undefined : source[key];
}

export function readRequiredStrings<TField extends string>(
  body: unknown,
  fields: readonly TField[],
): Record<TField, string> {
  const source = isPlainObject(body) ? body : {};
  const values = {} as Record<TField, string>;
  const errors: string[] = [];

  for (const field of fields) {
    const value = findFieldIgnoringCase(source, field);

    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`The ${field} field is required.`);
      continue;
    }

    values[field] = value;
  }

  if (errors.length > 0) {
    throw new BadRequestError(errors.join(' '));
  }

  return values;
}
