import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_BUCKET = 'uploads';

@Injectable()
export class UploadsService {
  private bucketReady = false;

  constructor(private readonly config: ConfigService) {}

  private supabaseUrl() {
    return (
      this.config.get<string>('SUPABASE_URL') ||
      this.config.get<string>('SUPABASE_PROJECT_URL') ||
      ''
    ).replace(/\/$/, '');
  }

  private serviceRoleKey() {
    return (
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.config.get<string>('SUPABASE_SERVICE_KEY') ||
      ''
    );
  }

  private bucket() {
    return this.config.get<string>('SUPABASE_STORAGE_BUCKET') || DEFAULT_BUCKET;
  }

  private uploadDir() {
    return this.config.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads');
  }

  private publicBaseUrl() {
    const base = this.config.get<string>('PUBLIC_API_URL') || 'http://localhost:3000';
    return base.replace(/\/$/, '');
  }

  private requireSupabase() {
    return Boolean(process.env.VERCEL) || this.config.get('NODE_ENV') === 'production';
  }

  private storageConfigured() {
    return Boolean(this.supabaseUrl() && this.serviceRoleKey());
  }

  private extFor(file: Express.Multer.File) {
    return ALLOWED_MIME[file.mimetype] || '.jpg';
  }

  async saveImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME[file.mimetype]) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    const filename = `${randomUUID()}${this.extFor(file)}`;

    if (this.storageConfigured()) {
      return this.saveToSupabase(file, filename);
    }

    if (this.requireSupabase()) {
      throw new ServiceUnavailableException(
        'Image uploads need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Copy them from Supabase → Project Settings → API.',
      );
    }

    return this.saveToDisk(file, filename);
  }

  private storageHeaders(extra?: Record<string, string>) {
    const key = this.serviceRoleKey();
    return {
      Authorization: `Bearer ${key}`,
      apikey: key,
      ...extra,
    };
  }

  private async storageFetch(path: string, init: RequestInit) {
    const url = `${this.supabaseUrl()}/storage/v1${path}`;
    const response = await fetch(url, init);
    const text = await response.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text };
      }
    }
    return { ok: response.ok, status: response.status, json };
  }

  private errorMessage(json: unknown, fallback: string) {
    if (json && typeof json === 'object') {
      const record = json as { message?: unknown; error?: unknown; msg?: unknown };
      const message = record.message || record.error || record.msg;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
  }

  private objectPath(bucket: string, filename: string) {
    const key = filename.split('/').map(encodeURIComponent).join('/');
    return `/object/${encodeURIComponent(bucket)}/${key}`;
  }

  private publicObjectUrl(filename: string) {
    const bucket = this.bucket();
    const key = filename.split('/').map(encodeURIComponent).join('/');
    return `${this.supabaseUrl()}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key}`;
  }

  private async makeBucketPublic(name: string) {
    await this.storageFetch(`/bucket/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: this.storageHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        public: true,
        file_size_limit: MAX_BYTES,
        allowed_mime_types: Object.keys(ALLOWED_MIME),
      }),
    });
  }

  private async ensureBucket() {
    if (this.bucketReady) return;
    const name = this.bucket();
    const existing = await this.storageFetch(`/bucket/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: this.storageHeaders(),
    });

    if (existing.ok) {
      await this.makeBucketPublic(name);
      this.bucketReady = true;
      return;
    }

    if (existing.status === 401 || existing.status === 403) {
      throw new ServiceUnavailableException(
        'Supabase Storage rejected the service role key. Use the service_role key from Project Settings → API, not the anon key.',
      );
    }

    const created = await this.storageFetch('/bucket', {
      method: 'POST',
      headers: this.storageHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: name,
        name,
        public: true,
        file_size_limit: MAX_BYTES,
        allowed_mime_types: Object.keys(ALLOWED_MIME),
      }),
    });

    if (!created.ok && created.status !== 409) {
      throw new ServiceUnavailableException(
        `Could not create storage bucket "${name}": ${this.errorMessage(created.json, 'unknown error')}`,
      );
    }
    await this.makeBucketPublic(name);
    this.bucketReady = true;
  }

  private async saveToSupabase(file: Express.Multer.File, filename: string) {
    await this.ensureBucket();
    const bucket = this.bucket();
    const uploaded = await this.storageFetch(this.objectPath(bucket, filename), {
      method: 'POST',
      headers: this.storageHeaders({
        'Content-Type': file.mimetype,
        'cache-control': '3600',
        'x-upsert': 'true',
      }),
      body: new Uint8Array(file.buffer),
    });

    if (!uploaded.ok) {
      throw new BadRequestException(
        this.errorMessage(uploaded.json, 'Failed to upload image to storage'),
      );
    }

    return { filename, url: this.publicObjectUrl(filename) };
  }

  private async saveToDisk(file: Express.Multer.File, filename: string) {
    const dir = this.uploadDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);
    return {
      filename,
      url: `${this.publicBaseUrl()}/uploads/${filename}`,
    };
  }
}
