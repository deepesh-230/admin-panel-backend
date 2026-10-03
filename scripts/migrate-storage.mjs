/**
 * Create uploads bucket on NEW Supabase, copy objects from OLD, rewrite public URLs in DB.
 *
 * Usage:
 *   OLD_SUPABASE_URL=... OLD_SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-storage.mjs
 *
 * Loads NEW credentials + DATABASE_URL from backend/.env
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnv(envPath);
const NEW_URL = (env.SUPABASE_URL || '').replace(/\/$/, '');
const NEW_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = env.SUPABASE_STORAGE_BUCKET || 'uploads';
const DATABASE_URL = env.DATABASE_URL;
const OLD_URL = (process.env.OLD_SUPABASE_URL || '').replace(/\/$/, '');
const OLD_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY || '';

if (!NEW_URL || !NEW_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_BYTES = 5 * 1024 * 1024;

function headers(key, extra = {}) {
  return { Authorization: `Bearer ${key}`, apikey: key, ...extra };
}

async function storageJson(base, key, path, init = {}) {
  const res = await fetch(`${base}/storage/v1${path}`, {
    ...init,
    headers: { ...headers(key), ...(init.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }
  return { ok: res.ok, status: res.status, json, text };
}

async function ensureBucket(base, key, name) {
  const existing = await storageJson(base, key, `/bucket/${encodeURIComponent(name)}`);
  if (existing.ok) {
    await storageJson(base, key, `/bucket/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public: true,
        file_size_limit: MAX_BYTES,
        allowed_mime_types: ALLOWED_MIME,
      }),
    });
    console.log(`Bucket "${name}" already exists — ensured public`);
    return;
  }

  const created = await storageJson(base, key, '/bucket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: name,
      name,
      public: true,
      file_size_limit: MAX_BYTES,
      allowed_mime_types: ALLOWED_MIME,
    }),
  });

  if (!created.ok && created.status !== 409) {
    throw new Error(
      `Create bucket failed (${created.status}): ${JSON.stringify(created.json)}`,
    );
  }
  console.log(`Bucket "${name}" created (public)`);
}

async function listAll(base, key, bucket, prefix = '') {
  const files = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await storageJson(
      base,
      key,
      `/object/list/${encodeURIComponent(bucket)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, limit, offset, sortBy: { column: 'name', order: 'asc' } }),
      },
    );
    if (!res.ok) {
      throw new Error(`List failed (${res.status}): ${JSON.stringify(res.json)}`);
    }
    const items = Array.isArray(res.json) ? res.json : [];
    if (!items.length) break;

    for (const item of items) {
      const path = prefix ? `${prefix}${item.name}` : item.name;
      // folders have id null and no metadata
      if (item.id === null && !item.metadata) {
        const nested = await listAll(base, key, bucket, `${path}/`);
        files.push(...nested);
      } else {
        files.push(path);
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }
  return files;
}

async function download(base, key, bucket, path) {
  const res = await fetch(
    `${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`,
    { headers: headers(key) },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Download ${path} failed (${res.status}): ${text}`);
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType };
}

async function upload(base, key, bucket, path, buf, contentType) {
  const res = await fetch(
    `${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`,
    {
      method: 'POST',
      headers: headers(key, {
        'Content-Type': contentType,
        'x-upsert': 'true',
      }),
      body: buf,
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Upload ${path} failed (${res.status}): ${text}`);
  }
}

function directDbUrl(url) {
  // Prisma pooler URL → direct :5432 for updates (strip Prisma/pgbouncer params)
  try {
    const u = new URL(url);
    if (u.hostname.includes('pooler.supabase.com')) {
      const ref = u.username.replace(/^postgres\./, '');
      u.hostname = `db.${ref}.supabase.co`;
      u.port = '5432';
      u.username = 'postgres';
    }
    for (const key of [
      'pgbouncer',
      'connection_limit',
      'pool_timeout',
      'connect_timeout',
    ]) {
      u.searchParams.delete(key);
    }
    u.searchParams.set('sslmode', 'require');
    return u.toString();
  } catch {
    return url;
  }
}

function psql(dbUrl, sql) {
  const result = spawnSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-c', sql], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'psql failed');
  }
  return (result.stdout || '').trim();
}

async function rewriteDbUrls(oldHost, newHost) {
  const dbUrl = directDbUrl(DATABASE_URL);
  const colsRaw = psql(
    dbUrl,
    `SELECT table_name || '|' || column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND data_type IN ('text', 'character varying')
     ORDER BY table_name, column_name`,
  );
  const cols = colsRaw ? colsRaw.split('\n').filter(Boolean) : [];
  let total = 0;
  const esc = (s) => s.replace(/'/g, "''");
  for (const row of cols) {
    const [table, column] = row.split('|');
    if (!table || !column) continue;
    const sql = `
      WITH u AS (
        UPDATE public."${table}"
        SET "${column}" = replace("${column}", '${esc(oldHost)}', '${esc(newHost)}')
        WHERE "${column}" LIKE '%${esc(oldHost)}%'
        RETURNING 1
      )
      SELECT count(*) FROM u;
    `;
    const count = Number(psql(dbUrl, sql) || '0');
    if (count > 0) {
      console.log(`  ${table}.${column}: ${count} row(s)`);
      total += count;
    }
  }
  console.log(`URL rewrite complete — ${total} cell(s) updated`);
}

async function main() {
  console.log(`NEW project: ${NEW_URL}`);
  await ensureBucket(NEW_URL, NEW_KEY, BUCKET);

  if (!OLD_URL || !OLD_KEY) {
    console.log(
      'No OLD_SUPABASE_URL / OLD_SUPABASE_SERVICE_ROLE_KEY — skipped file copy.',
    );
    console.log('Bucket is ready for new uploads.');
    return;
  }

  console.log(`OLD project: ${OLD_URL}`);
  console.log(`Listing objects in "${BUCKET}"...`);
  let files = [];
  try {
    files = await listAll(OLD_URL, OLD_KEY, BUCKET);
  } catch (err) {
    console.error('Could not list old bucket:', err.message);
    console.log('Bucket on NEW is ready; migrate files manually if needed.');
    return;
  }

  console.log(`Found ${files.length} object(s)`);
  let ok = 0;
  let fail = 0;
  for (const path of files) {
    try {
      const { buf, contentType } = await download(OLD_URL, OLD_KEY, BUCKET, path);
      await upload(NEW_URL, NEW_KEY, BUCKET, path, buf, contentType);
      ok += 1;
      console.log(`  ✓ ${path} (${buf.length} bytes)`);
    } catch (err) {
      fail += 1;
      console.error(`  ✗ ${path}: ${err.message}`);
    }
  }
  console.log(`Copied ${ok}/${files.length} (failed: ${fail})`);

  const oldHost = new URL(OLD_URL).hostname;
  const newHost = new URL(NEW_URL).hostname;
  console.log(`Rewriting DB URLs ${oldHost} → ${newHost}`);
  await rewriteDbUrls(oldHost, newHost);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
