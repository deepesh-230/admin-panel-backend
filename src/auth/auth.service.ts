import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_TTL_MS, authCache } from '../common/utils/ttl-cache';
import {
  assertSubcategoryIds,
  resolvePlaceProfileFields,
  syncUserDisabilities,
} from '../common/utils/user-profile';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordByOtpDto,
  ResetPasswordDto,
} from './dto/auth.dto';

type SessionMeta = {
  userAgent?: string;
  ipAddress?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
    location: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    digipin: string | null;
    pincode: string | null;
    km: number | null;
    ageRange: string | null;
    isActive: boolean;
    stateId: string | null;
    role: { name: RoleName; permissions?: { permission: { code: string } }[] };
    userStates?: {
      stateId: string;
      isPrimary: boolean;
      state: { id: string; name: string; code: string | null };
    }[];
    disabilities?: {
      subcategory: {
        id: string;
        name: string;
        categoryId: string;
        category: { id: string; name: string };
      };
    }[];
  }) {
    const disabilities = (user.disabilities || []).map((d) => ({
      id: d.subcategory.id,
      name: d.subcategory.name,
      categoryId: d.subcategory.categoryId,
      categoryName: d.subcategory.category.name,
    }));
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      city: user.city,
      latitude: user.latitude,
      longitude: user.longitude,
      digipin: user.digipin,
      pincode: user.pincode,
      km: user.km,
      ageRange: user.ageRange,
      isActive: user.isActive,
      stateId: user.stateId,
      stateIds: [
        ...new Set(
          [
            user.stateId,
            ...(user.userStates || []).map((us) => us.state?.id || us.stateId),
          ].filter((id): id is string => Boolean(id)),
        ),
      ],
      role: user.role.name,
      permissions: (user.role.permissions || []).map((rp) => rp.permission.code),
      states: (user.userStates || []).map((us) => ({
        id: us.state.id,
        name: us.state.name,
        code: us.state.code,
        isPrimary: us.isPrimary,
      })),
      disabilities,
      disabilitySubcategoryIds: disabilities.map((d) => d.id),
    };
  }

  private userInclude() {
    return {
      role: { include: { permissions: { include: { permission: { select: { code: true } } } } } },
      userStates: { include: { state: { select: { id: true, name: true, code: true } } } },
    } as const;
  }

  private async issueTokens(userId: string, email: string, meta: SessionMeta = {}) {
    const payload = { sub: userId, email };
    const refreshToken = randomBytes(48).toString('hex');
    const refreshDays = Number(this.config.get<string>('JWT_REFRESH_DAYS') || 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    const [accessToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
        expiresIn: 60 * 15,
      }),
      this.prisma.refreshToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          userId,
          expiresAt,
          session: {
            create: {
              userId,
              userAgent: meta.userAgent,
              ipAddress: meta.ipAddress,
              expiresAt,
            },
          },
        },
      }),
    ]);

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async register(dto: RegisterDto, meta: SessionMeta = {}) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const role = await this.getRoleByName(RoleName.END_USER);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const place = await resolvePlaceProfileFields(this.prisma, {
      location: dto.location,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      pincode: dto.pincode,
      stateId: dto.stateId,
      stateName: dto.stateName,
    });
    const disabilityIds = dto.disabilitySubcategoryIds
      ? await assertSubcategoryIds(this.prisma, dto.disabilitySubcategoryIds)
      : [];

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          phone: dto.phone,
          km: dto.km ?? 1,
          ageRange: dto.ageRange,
          roleId: role.id,
          emailVerifiedAt: new Date(),
          ...place,
          ...(place.stateId
            ? {
                userStates: {
                  create: { stateId: place.stateId, isPrimary: true },
                },
              }
            : {}),
        },
        include: this.userInclude(),
      });

      if (disabilityIds.length) {
        await syncUserDisabilities(tx, created.id, disabilityIds);
        return tx.user.findUniqueOrThrow({
          where: { id: created.id },
          include: this.userInclude(),
        });
      }

      return created;
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
    const email = dto.email.toLowerCase();
    const started = Date.now();
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        passwordHash: string;
        name: string | null;
        phone: string | null;
        location: string | null;
        city: string | null;
        latitude: number | null;
        longitude: number | null;
        digipin: string | null;
        pincode: string | null;
        km: number | null;
        ageRange: string | null;
        isActive: boolean;
        stateId: string | null;
        role: RoleName;
        permissions: unknown;
        states: unknown;
      }>
    >`
      SELECT
        u.id,
        u.email,
        u."passwordHash",
        u.name,
        u.phone,
        u.location,
        u.city,
        u.latitude,
        u.longitude,
        u.digipin,
        u.pincode,
        u.km,
        u."ageRange",
        u."isActive",
        u."stateId",
        r.name AS role,
        COALESCE((
          SELECT json_agg(p.code)
          FROM "RolePermission" rp
          JOIN "Permission" p ON p.id = rp."permissionId"
          WHERE rp."roleId" = u."roleId"
        ), json_build_array()) AS permissions,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', s.id,
            'name', s.name,
            'code', s.code,
            'isPrimary', us."isPrimary"
          ))
          FROM "UserState" us
          JOIN "State" s ON s.id = us."stateId"
          WHERE us."userId" = u.id
        ), json_build_array()) AS states
      FROM "User" u
      INNER JOIN "Role" r ON r.id = u."roleId"
      WHERE u.email = ${email}
      LIMIT 1
    `;
    const userMs = Date.now() - started;
    const row = rows[0];

    if (!row || !row.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const bcryptStarted = Date.now();
    const valid = await bcrypt.compare(dto.password, row.passwordHash);
    const bcryptMs = Date.now() - bcryptStarted;
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const tokenStarted = Date.now();
    const tokens = await this.issueTokens(row.id, row.email, meta);
    const tokenMs = Date.now() - tokenStarted;

    const permissions = Array.isArray(row.permissions)
      ? (row.permissions as string[])
      : [];
    const states = Array.isArray(row.states)
      ? (row.states as Array<{
          id: string;
          name: string;
          code: string | null;
          isPrimary: boolean;
        }>)
      : [];

    const stateIds = [
      ...new Set([row.stateId, ...states.map((s) => s.id)].filter((id): id is string => Boolean(id))),
    ];

    authCache.set(
      `auth:${row.id}`,
      {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        stateId: row.stateId,
        stateIds,
        permissions,
      },
      AUTH_TTL_MS,
    );

    this.logger.log(
      `login user=${userMs}ms bcrypt=${bcryptMs}ms tokens=${tokenMs}ms total=${Date.now() - started}ms`,
    );

    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: row.id,
          email: row.email,
          name: row.name,
          phone: row.phone,
          location: row.location,
          city: row.city,
          latitude: row.latitude,
          longitude: row.longitude,
          digipin: row.digipin,
          pincode: row.pincode,
          km: row.km,
          ageRange: row.ageRange,
          isActive: row.isActive,
          stateId: row.stateId,
          stateIds,
          role: row.role,
          permissions,
          states,
          disabilities: [],
          disabilitySubcategoryIds: [],
        },
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

  async resetPasswordByOtp(dto: ResetPasswordByOtpDto) {
    const devOtp = this.config.get<string>('AUTH_DEV_OTP') || '0000';
    if (dto.otp !== devOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
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
