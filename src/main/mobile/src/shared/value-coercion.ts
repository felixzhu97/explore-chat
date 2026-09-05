export function toOptionalDate(
  value: string | Date | undefined,
): Date | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value : new Date(value);
}

export function toRequiredDate(value: string | Date | undefined): Date {
  if (value == null) return new Date(0);
  return value instanceof Date ? value : new Date(value);
}

export function toOptionalNumber(
  value: string | number | undefined,
): number | undefined {
  if (value == null) return undefined;
  return typeof value === "string" ? Number(value) : value;
}
