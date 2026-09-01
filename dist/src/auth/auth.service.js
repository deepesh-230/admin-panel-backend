"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    mail;
    constructor(prisma, jwt, config, mail) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.mail = mail;
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async getRoleByName(name) {
        const role = await this.prisma.role.findUnique({ where: { name } });
        if (!role)
            throw new common_1.BadRequestException(`Role ${name} is not configured`);
        return role;
    }
    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            isActive: user.isActive,
            stateId: user.stateId,
            role: user.role.name,
            permissions: (user.role.permissions || []).map((rp) => rp.permission.code),
            states: (user.userStates || []).map((us) => ({
                id: us.state.id,
                name: us.state.name,
                code: us.state.code,
                isPrimary: us.isPrimary,
            })),
        };
    }
    userInclude() {
        return {
            role: { include: { permissions: { include: { permission: true } } } },
            userStates: { include: { state: true } },
        };
    }
    async issueTokens(userId, email, meta = {}) {
        const payload = { sub: userId, email };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET') || 'dev-access-secret',
            expiresIn: 60 * 15,
        });
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('hex');
        const refreshDays = Number(this.config.get('JWT_REFRESH_DAYS') || 7);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshDays);
        const storedRefresh = await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hashToken(refreshToken),
                userId,
                expiresAt,
            },
        });
        await this.prisma.session.create({
            data: {
                userId,
                refreshTokenId: storedRefresh.id,
                userAgent: meta.userAgent,
                ipAddress: meta.ipAddress,
                expiresAt,
            },
        });
        return { accessToken, refreshToken, expiresIn: 900 };
    }
    async register(dto, meta = {}) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const role = await this.getRoleByName(client_1.RoleName.END_USER);
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                name: dto.name,
                phone: dto.phone,
                roleId: role.id,
            },
            include: this.userInclude(),
        });
        const tokens = await this.issueTokens(user.id, user.email, meta);
        return {
            success: true,
            message: 'Registered successfully',
            data: {
                user: this.sanitizeUser(user),
                ...tokens,
            },
        };
    }
    async login(dto, meta = {}) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: this.userInclude(),
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const tokens = await this.issueTokens(user.id, user.email, meta);
        return {
            success: true,
            message: 'Logged in successfully',
            data: {
                user: this.sanitizeUser(user),
                ...tokens,
            },
        };
    }
    async refresh(refreshToken, meta = {}) {
        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true, session: true },
        });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (!stored.user.isActive) {
            throw new common_1.UnauthorizedException('User is inactive');
        }
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
                where: { id: stored.id },
                data: { revokedAt: new Date() },
            }),
            ...(stored.session
                ? [
                    this.prisma.session.update({
                        where: { id: stored.session.id },
                        data: { revokedAt: new Date() },
                    }),
                ]
                : []),
        ]);
        const tokens = await this.issueTokens(stored.user.id, stored.user.email, meta);
        return {
            success: true,
            message: 'Token refreshed',
            data: tokens,
        };
    }
    async logout(refreshToken) {
        if (refreshToken) {
            const tokenHash = this.hashToken(refreshToken);
            const stored = await this.prisma.refreshToken.findUnique({
                where: { tokenHash },
                include: { session: true },
            });
            if (stored && !stored.revokedAt) {
                await this.prisma.$transaction([
                    this.prisma.refreshToken.update({
                        where: { id: stored.id },
                        data: { revokedAt: new Date() },
                    }),
                    ...(stored.session
                        ? [
                            this.prisma.session.update({
                                where: { id: stored.session.id },
                                data: { revokedAt: new Date() },
                            }),
                        ]
                        : []),
                ]);
            }
        }
        return {
            success: true,
            message: 'Logged out successfully',
            data: null,
        };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: this.userInclude(),
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            success: true,
            message: 'OK',
            data: this.sanitizeUser(user),
        };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        let resetToken;
        if (user) {
            const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            await this.prisma.passwordResetToken.create({
                data: {
                    tokenHash: this.hashToken(rawToken),
                    userId: user.id,
                    expiresAt,
                },
            });
            const adminUrl = (this.config.get('ADMIN_URL') || 'http://localhost:5173').replace(/\/$/, '');
            const resetUrl = `${adminUrl}/reset-password?token=${rawToken}`;
            await this.mail.sendPasswordReset(user.email, resetUrl);
            const expose = this.config.get('AUTH_EXPOSE_RESET_TOKEN') === 'true' ||
                this.config.get('NODE_ENV') !== 'production';
            if (expose) {
                resetToken = rawToken;
            }
        }
        return {
            success: true,
            message: 'If the email exists, a reset link has been sent',
            data: resetToken ? { resetToken } : null,
        };
    }
    async resetPassword(dto) {
        const tokenHash = this.hashToken(dto.token);
        const stored = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: stored.userId },
                data: { passwordHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: stored.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId: stored.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
            this.prisma.session.updateMany({
                where: { userId: stored.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);
        return {
            success: true,
            message: 'Password reset successfully',
            data: null,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map