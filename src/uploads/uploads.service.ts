import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  private uploadDir() {
    return (
      this.config.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads')
    );
  }

  /** Public origin for file URLs. A localhost PUBLIC_API_URL is ignored when the request came in on a public host. */
  private publicBaseUrl(req?: Request) {
    const configured = (
      this.config.get<string>('PUBLIC_API_URL') || 'http://localhost:3000'
    ).replace(/\/$/, '');
    const fromRequest = this.originFromRequest(req);
    if (fromRequest && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
      return fromRequest;
    }
    return configured;
  }

  private originFromRequest(req?: Request) {
    if (!req) return null;
    const rawHost = req.headers['x-forwarded-host'] || req.headers.host;
    if (!rawHost) return null;
    const host = String(rawHost).split(',')[0].trim();
    if (!host || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) return null;
    const forwarded = req.headers['x-forwarded-proto'];
    const proto = forwarded
      ? String(forwarded).split(',')[0].trim()
      : 'https';
    return `${proto === 'http' ? 'http' : 'https'}://${host}`;
  }

  private extFor(file: Express.Multer.File) {
    return ALLOWED_MIME[file.mimetype] || '.jpg';
  }

  async saveImage(file: Express.Multer.File, req?: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME[file.mimetype]) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    const filename = `${randomUUID()}${this.extFor(file)}`;
    const dir = this.uploadDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);
    return {
      filename,
      url: `${this.publicBaseUrl(req)}/uploads/${filename}`,
    };
  }
}
