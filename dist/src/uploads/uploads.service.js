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
const ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);
const MAX_BYTES = 5 * 1024 * 1024;
let UploadsService = class UploadsService {
    config;
    constructor(config) {
        this.config = config;
    }
    uploadDir() {
        return this.config.get('UPLOAD_DIR') || (0, path_1.join)(process.cwd(), 'uploads');
    }
    publicBaseUrl() {
        const base = this.config.get('PUBLIC_API_URL') || 'http://localhost:3000';
        return base.replace(/\/$/, '');
    }
    async saveImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        if (!ALLOWED_MIME.has(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
        }
        if (file.size > MAX_BYTES) {
            throw new common_1.BadRequestException('Image must be 5 MB or smaller');
        }
        const ext = (0, path_1.extname)(file.originalname) || '.jpg';
        const filename = `${(0, crypto_1.randomUUID)()}${ext}`;
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