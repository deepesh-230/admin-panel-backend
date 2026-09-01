export function normalizeRow(raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null) continue;
    out[key.trim().toLowerCase()] = String(value).trim();
  }
  return out;
}

export function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key.toLowerCase()];
    if (val) return val;
  }
  return '';
}

export function parseBool(value: string | undefined, fallback = true): boolean {
  if (!value) return fallback;
  const v = value.toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return fallback;
}

export function parseIntSafe(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseFloatSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
