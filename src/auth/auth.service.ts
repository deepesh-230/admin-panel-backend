import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

type SessionMeta = {
  userAgent?: string;
  ipAddress?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async getRoleByName(name: RoleName) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw new BadRequestException(`Role ${name} is not configured`);
    return role;
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    isActive: boolean;
    stateId: string | null;
    role: { name: RoleName; permissions?: { permission: { code: string } }[] };
    userStates?: { stateId: string; isPrimary: boolean; state: { id: string; name: string; code: string | null } }[];
  }) {
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

  private userInclude() {
    return {
      role: { include: { permissions: { include: { permission: true } } } },
      userStates: { include: { state: true } },
    } as const;
  }

  private async issueTokens(userId: string, email: string, meta: SessionMeta = {}) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
      expiresIn: 60 * 15,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshDays = Number(this.config.get<string>('JWT_REFRESH_DAYS') || 7);
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

  async register(dto: RegisterDto, meta: SessionMeta = {}) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const role = await this.getRoleByName(RoleName.END_USER);
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

  async login(dto: LoginDto, meta: SessionMeta = {}) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: this.userInclude(),
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

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

  async refresh(refreshToken: string, meta: SessionMeta = {}) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true, session: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('User is inactive');
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

  async logout(refreshToken?: string) {
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

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: this.userInclude(),
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      message: 'OK',
      data: this.sanitizeUser(user),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    let resetToken: string | undefined;

    // Always return success to avoid email enumeration
    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.prisma.passwordResetToken.create({
        data: {
          tokenHash: this.hashToken(rawToken),
          userId: user.id,
          expiresAt,
        },
      });

      const adminUrl = (
        this.config.get<string>('ADMIN_URL') || 'http://localhost:5173'
      ).replace(/\/$/, '');
      const resetUrl = `${adminUrl}/reset-password?token=${rawToken}`;

      await this.mail.sendPasswordReset(user.email, resetUrl);

      // Only expose raw token in non-prod / explicit opt-in (local testing)
      const expose =
        this.config.get<string>('AUTH_EXPOSE_RESET_TOKEN') === 'true' ||
        this.config.get<string>('NODE_ENV') !== 'production';

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

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
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
}
