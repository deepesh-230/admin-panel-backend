import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  private uploadDir() {
    return this.config.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads');
  }

  private publicBaseUrl() {
    const base = this.config.get<string>('PUBLIC_API_URL') || 'http://localhost:3000';
    return base.replace(/\/$/, '');
  }

  async saveImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    const ext = extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const dir = this.uploadDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);

    return {
      filename,
      url: `${this.publicBaseUrl()}/uploads/${filename}`,
    };
  }
}
