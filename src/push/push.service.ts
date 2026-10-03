import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../prisma/prisma.service';

export type PushPayload = {
  title: string;
  body?: string;
  data?: Record<string, string>;
};

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private ready = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    if (getApps().length > 0) {
      this.ready = true;
      return;
    }

    const credentials = this.loadCredentials();
    if (!credentials) {
      this.logger.warn(
        'Firebase credentials not set (FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON) — push sends will be skipped',
      );
      return;
    }

    try {
      initializeApp({
        credential: cert(credentials),
      });
      this.ready = true;
      this.logger.log('Firebase Admin initialized for push');
    } catch (error) {
      this.logger.error(
        `Failed to init Firebase Admin: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private loadCredentials(): ServiceAccount | null {
    const pathValue = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH')?.trim();
    if (pathValue) {
      const absolute = resolve(process.cwd(), pathValue);
      if (!existsSync(absolute)) {
        this.logger.error(`FIREBASE_SERVICE_ACCOUNT_PATH not found: ${absolute}`);
        return null;
      }
      try {
        return JSON.parse(readFileSync(absolute, 'utf8')) as ServiceAccount;
      } catch (error) {
        this.logger.error(
          `Invalid service account file: ${error instanceof Error ? error.message : String(error)}`,
        );
        return null;
      }
    }

    const raw = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON')?.trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ServiceAccount;
    } catch (error) {
      this.logger.error(
        `Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async registerToken(userId: string, token: string, platform: string) {
    const normalized = token.trim();
    if (!normalized) return null;

    return this.prisma.deviceToken.upsert({
      where: { token: normalized },
      create: {
        userId,
        token: normalized,
        platform: platform.toLowerCase(),
      },
      update: {
        userId,
        platform: platform.toLowerCase(),
      },
    });
  }

  async removeToken(userId: string, token?: string) {
    if (token?.trim()) {
      await this.prisma.deviceToken.deleteMany({
        where: { userId, token: token.trim() },
      });
      return { removed: true };
    }
    await this.prisma.deviceToken.deleteMany({ where: { userId } });
    return { removed: true };
  }

  /** Mint a Firebase Auth custom token so the mobile app can use Firestore securely. */
  async createCustomToken(userId: string) {
    if (!this.ready) {
      throw new Error(
        'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH to enable chat.',
      );
    }
    const { getAuth } = await import('firebase-admin/auth');
    const token = await getAuth().createCustomToken(userId);
    return { token };
  }

  async sendToUserIds(userIds: string[], payload: PushPayload) {
    if (!this.ready || userIds.length === 0) {
      return { successCount: 0, failureCount: 0, skipped: !this.ready };
    }

    const rows = await this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, token: true },
    });
    if (rows.length === 0) {
      this.logger.warn(
        `No device tokens for ${userIds.length} recipient user(s) — inbox rows may exist but FCM was not sent`,
      );
      return { successCount: 0, failureCount: 0, skipped: false };
    }
    this.logger.log(`Sending FCM to ${rows.length} device token(s) for ${userIds.length} user(s)`);

    const data: Record<string, string> = {};
    if (payload.data) {
      for (const [key, value] of Object.entries(payload.data)) {
        if (value != null) data[key] = String(value);
      }
    }

    const tokens = rows.map((r) => r.token);
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;
    const messaging = getMessaging();

    const chunkSize = 500;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data,
          android: {
            priority: 'high',
            notification: {
              channelId: 'default',
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
        });

        successCount += response.successCount;
        failureCount += response.failureCount;

        response.responses.forEach((res, index) => {
          if (res.success) return;
          const code = res.error?.code ?? '';
          if (
            code.includes('registration-token-not-registered') ||
            code.includes('invalid-registration-token') ||
            code.includes('invalid-argument')
          ) {
            invalidTokens.push(chunk[index]);
          }
        });
      } catch (error) {
        failureCount += chunk.length;
        this.logger.error(
          `FCM send failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (invalidTokens.length > 0) {
      await this.prisma.deviceToken.deleteMany({
        where: { token: { in: invalidTokens } },
      });
      this.logger.warn(`Pruned ${invalidTokens.length} invalid device token(s)`);
    }

    return { successCount, failureCount, skipped: false };
  }
}
