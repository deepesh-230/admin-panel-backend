import { haversineKm, isWithinRadius } from './geo';

describe('geo utils', () => {
  it('computes short Hyderabad distance', () => {
    // Banjara Hills-ish vs nearby point ~1–2 km
    const d = haversineKm(17.4126, 78.4485, 17.42, 78.45);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(5);
  });

  it('filters by radius', () => {
    expect(isWithinRadius(17.4126, 78.4485, 17.42, 78.45, 10)).toBe(true);
    expect(isWithinRadius(17.4126, 78.4485, 18.5, 78.5, 10)).toBe(false);
    expect(isWithinRadius(17.4126, 78.4485, null, null, 10)).toBe(false);
  });
});
