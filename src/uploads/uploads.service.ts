import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  private uploadDir() {
    return (
      this.config.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads')
    );
  }

  private publicBaseUrl() {
    const base =
      this.config.get<string>('PUBLIC_API_URL') || 'http://localhost:3000';
    return base.replace(/\/$/, '');
  }

  private extFor(file: Express.Multer.File) {
    return ALLOWED_MIME[file.mimetype] || '.jpg';
  }

  async saveImage(file: Express.Multer.File) {
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
      url: `${this.publicBaseUrl()}/uploads/${filename}`,
    };
  }
}
