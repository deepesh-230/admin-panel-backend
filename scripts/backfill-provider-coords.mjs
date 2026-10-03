/**
 * One-off: geocode ServiceProviders missing lat/lng (optionally filter by name).
 * Usage: node scripts/backfill-provider-coords.mjs
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      let v = l.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return [l.slice(0, i).trim(), v];
    }),
);

const API_KEY = env.GOOGLE_MAPS_API_KEY;
const DATABASE_URL = env.DATABASE_URL;

function directDbUrl(url) {
  const u = new URL(url);
  if (u.hostname.includes('pooler.supabase.com')) {
    const ref = u.username.replace(/^postgres\./, '');
    u.hostname = `db.${ref}.supabase.co`;
    u.port = '5432';
    u.username = 'postgres';
  }
  for (const key of ['pgbouncer', 'connection_limit', 'pool_timeout', 'connect_timeout']) {
    u.searchParams.delete(key);
  }
  u.searchParams.set('sslmode', 'require');
  return u.toString();
}

function psql(sql) {
  const r = spawnSync(
    'psql',
    [directDbUrl(DATABASE_URL), '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-F', '|', '-c', sql],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || 'psql failed');
  return (r.stdout || '').trim();
}

async function geocode(query) {
  const params = new URLSearchParams({
    address: query,
    key: API_KEY,
    components: 'country:IN',
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  if (data.status !== 'OK' || !loc) {
    throw new Error(`geocode failed for "${query}": ${data.status} ${data.error_message || ''}`);
  }
  return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address };
}

async function main() {
  if (!API_KEY) throw new Error('GOOGLE_MAPS_API_KEY missing');
  const rows = psql(`
    SELECT id || '|' || coalesce(name,'') || '|' || coalesce(address,'') || '|' || coalesce(city,'')
    FROM "ServiceProvider"
    WHERE (latitude IS NULL OR longitude IS NULL)
      AND name ILIKE 'KIMS%'
    ORDER BY "createdAt" DESC
  `);
  if (!rows) {
    console.log('No KIMS providers missing coordinates');
    return;
  }
  for (const line of rows.split('\n').filter(Boolean)) {
    const [id, name, address, city] = line.split('|');
    const query = [address, city, 'India'].filter(Boolean).join(', ') || `${name}, India`;
    console.log(`Geocoding ${name}…`);
    const geo = await geocode(query);
    psql(`
      UPDATE "ServiceProvider"
      SET latitude = ${geo.lat}, longitude = ${geo.lng}
      WHERE id = '${id.replace(/'/g, "''")}'
    `);
    console.log(`  ✓ ${geo.lat}, ${geo.lng} (${geo.formatted})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
