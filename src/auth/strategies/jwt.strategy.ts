import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_TTL_MS, authCache } from '../../common/utils/ttl-cache';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const cacheKey = `auth:${payload.sub}`;
    const cached = authCache.get<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      stateId: string | null;
      stateIds: string[];
      permissions: string[];
    }>(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
        userStates: { select: { stateId: true, isPrimary: true } },
      },
    });

    if (!user || !user.isActive) return null;

    const stateIds = [
      ...new Set(
        [
          user.stateId,
          ...user.userStates.map((us) => us.stateId),
        ].filter((id): id is string => Boolean(id)),
      ),
    ];

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      stateId: user.stateId,
      stateIds,
      permissions: user.role.permissions.map((rp) => rp.permission.code),
    };
    authCache.set(cacheKey, authUser, AUTH_TTL_MS);
    return authUser;
  }
}
