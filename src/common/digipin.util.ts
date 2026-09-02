const DIGIPIN_GRID = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T'],
] as const;

const BOUNDS = Object.freeze({
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5,
});

/** Encode latitude/longitude into India Post DIGIPIN (10 chars with hyphens). */
export function encodeDigipin(lat: number, lon: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) return null;
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon) return null;

  const latitude = Number(lat.toFixed(6));
  const longitude = Number(lon.toFixed(6));

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let pin = '';

  for (let level = 1; level <= 10; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const row = 3 - Math.floor((latitude - minLat) / latDiv);
    const col = Math.floor((longitude - minLon) / lonDiv);

    const r = Math.min(Math.max(row, 0), 3);
    const c = Math.min(Math.max(col, 0), 3);

    pin += DIGIPIN_GRID[r][c];
    if (level === 3 || level === 6) pin += '-';

    maxLat = minLat + latDiv * (4 - r);
    minLat = minLat + latDiv * (3 - r);
    minLon = minLon + lonDiv * c;
    maxLon = minLon + lonDiv;
  }

  return pin;
}

export function resolveDigipinFields(
  latitude?: number | null,
  longitude?: number | null,
  pincode?: string | null,
) {
  const digipin =
    latitude != null && longitude != null ? encodeDigipin(latitude, longitude) : null;

  const result: { digipin: string | null; pincode?: string | null } = { digipin };
  if (pincode !== undefined) {
    result.pincode = pincode?.trim() || null;
  }
  return result;
}
