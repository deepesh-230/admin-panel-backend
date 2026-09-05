"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const crypto_1 = require("crypto");
const ALLOWED_MIME = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/pjpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};
const MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_BUCKET = 'uploads';
let UploadsService = class UploadsService {
    config;
    bucketReady = false;
    constructor(config) {
        this.config = config;
    }
    supabaseUrl() {
        return (this.config.get('SUPABASE_URL') ||
            this.config.get('SUPABASE_PROJECT_URL') ||
            '').replace(/\/$/, '');
    }
    serviceRoleKey() {
        return (this.config.get('SUPABASE_SERVICE_ROLE_KEY') ||
            this.config.get('SUPABASE_SERVICE_KEY') ||
            '');
    }
    bucket() {
        return this.config.get('SUPABASE_STORAGE_BUCKET') || DEFAULT_BUCKET;
    }
    uploadDir() {
        return this.config.get('UPLOAD_DIR') || (0, path_1.join)(process.cwd(), 'uploads');
    }
    publicBaseUrl() {
        const base = this.config.get('PUBLIC_API_URL') || 'http://localhost:3000';
        return base.replace(/\/$/, '');
    }
    requireSupabase() {
        return Boolean(process.env.VERCEL) || this.config.get('NODE_ENV') === 'production';
    }
    storageConfigured() {
        return Boolean(this.supabaseUrl() && this.serviceRoleKey());
    }
    extFor(file) {
        return ALLOWED_MIME[file.mimetype] || '.jpg';
    }
    async saveImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        if (!ALLOWED_MIME[file.mimetype]) {
            throw new common_1.BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
        }
        if (file.size > MAX_BYTES) {
            throw new common_1.BadRequestException('Image must be 5 MB or smaller');
        }
        const filename = `${(0, crypto_1.randomUUID)()}${this.extFor(file)}`;
        if (this.storageConfigured()) {
            return this.saveToSupabase(file, filename);
        }
        if (this.requireSupabase()) {
            throw new common_1.ServiceUnavailableException('Image uploads need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Copy them from Supabase → Project Settings → API.');
        }
        return this.saveToDisk(file, filename);
    }
    storageHeaders(extra) {
        const key = this.serviceRoleKey();
        return {
            Authorization: `Bearer ${key}`,
            apikey: key,
            ...extra,
        };
    }
    async storageFetch(path, init) {
        const url = `${this.supabaseUrl()}/storage/v1${path}`;
        const response = await fetch(url, init);
        const text = await response.text();
        let json = null;
        if (text) {
            try {
                json = JSON.parse(text);
            }
            catch {
                json = { message: text };
            }
        }
        return { ok: response.ok, status: response.status, json };
    }
    errorMessage(json, fallback) {
        if (json && typeof json === 'object') {
            const record = json;
            const message = record.message || record.error || record.msg;
            if (typeof message === 'string' && message.trim())
                return message;
        }
        return fallback;
    }
    objectPath(bucket, filename) {
        const key = filename.split('/').map(encodeURIComponent).join('/');
        return `/object/${encodeURIComponent(bucket)}/${key}`;
    }
    publicObjectUrl(filename) {
        const bucket = this.bucket();
        const key = filename.split('/').map(encodeURIComponent).join('/');
        return `${this.supabaseUrl()}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key}`;
    }
    async makeBucketPublic(name) {
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
    async ensureBucket() {
        if (this.bucketReady)
            return;
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
            throw new common_1.ServiceUnavailableException('Supabase Storage rejected the service role key. Use the service_role key from Project Settings → API, not the anon key.');
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
            throw new common_1.ServiceUnavailableException(`Could not create storage bucket "${name}": ${this.errorMessage(created.json, 'unknown error')}`);
        }
        await this.makeBucketPublic(name);
        this.bucketReady = true;
    }
    async saveToSupabase(file, filename) {
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
            throw new common_1.BadRequestException(this.errorMessage(uploaded.json, 'Failed to upload image to storage'));
        }
        return { filename, url: this.publicObjectUrl(filename) };
    }
    async saveToDisk(file, filename) {
        const dir = this.uploadDir();
        await (0, promises_1.mkdir)(dir, { recursive: true });
        await (0, promises_1.writeFile)((0, path_1.join)(dir, filename), file.buffer);
        return {
            filename,
            url: `${this.publicBaseUrl()}/uploads/${filename}`,
        };
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map