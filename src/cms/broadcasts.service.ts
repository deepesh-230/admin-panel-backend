import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BroadcastContentType, RoleName } from '@prisma/client';
import { PushService } from '../push/push.service';
import { PrismaService } from '../prisma/prisma.service';

export type BroadcastResult = {
  recipientCount: number;
  broadcastAt: Date;
  message: string;
  push?: { successCount: number; failureCount: number; skipped: boolean };
};

@Injectable()
export class BroadcastsService {
  private readonly logger = new Logger(BroadcastsService.name);

  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

  private async notifyEndUsers(params: {
    contentType: BroadcastContentType;
    jobAlertId?: string;
    usefulLinkId?: string;
    title: string;
    body?: string;
    url?: string;
  }): Promise<BroadcastResult> {
    const endUsers = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: RoleName.END_USER },
      },
      select: { id: true },
    });

    const broadcastAt = new Date();
    const userIds = endUsers.map((user) => user.id);

    if (userIds.length > 0) {
      await this.prisma.userBroadcast.createMany({
        data: userIds.map((userId) => ({
          userId,
          contentType: params.contentType,
          jobAlertId: params.jobAlertId,
          usefulLinkId: params.usefulLinkId,
          title: params.title,
          body: params.body,
          url: params.url,
        })),
      });
    }

    let push: BroadcastResult['push'];
    if (userIds.length > 0) {
      try {
        push = await this.push.sendToUserIds(userIds, {
          title: params.title,
          body: params.body,
          data: {
            contentType: params.contentType,
            ...(params.jobAlertId ? { jobAlertId: params.jobAlertId } : {}),
            ...(params.usefulLinkId ? { usefulLinkId: params.usefulLinkId } : {}),
            ...(params.url ? { url: params.url } : {}),
          },
        });
      } catch (error) {
        this.logger.error(
          `Push fan-out failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        push = { successCount: 0, failureCount: 0, skipped: true };
      }
    }

    this.logger.log(
      `Broadcast ${params.contentType} → recipients=${endUsers.length}` +
        (push
          ? ` push success=${push.successCount} fail=${push.failureCount} skipped=${push.skipped}`
          : ' push=n/a'),
    );

    return {
      recipientCount: endUsers.length,
      broadcastAt,
      message:
        endUsers.length > 0
          ? `Broadcast sent to ${endUsers.length} app user(s)`
          : 'No active app users to notify',
      push,
    };
  }

  async broadcastUsefulLink(id: string) {
    const link = await this.prisma.usefulLink.findUnique({ where: { id } });
    if (!link) throw new BadRequestException('Useful link not found');
    if (!link.isActive) {
      throw new BadRequestException('Cannot broadcast an inactive useful link');
    }

    const result = await this.notifyEndUsers({
      contentType: BroadcastContentType.USEFUL_LINK,
      usefulLinkId: link.id,
      title: link.title,
      url: link.url,
    });

    const updated = await this.prisma.usefulLink.update({
      where: { id },
      data: { broadcastAt: result.broadcastAt },
    });

    return { ...updated, ...result };
  }

  async broadcastJobAlert(id: string) {
    const alert = await this.prisma.jobAlert.findUnique({ where: { id } });
    if (!alert) throw new BadRequestException('Job alert not found');
    if (!alert.isActive) {
      throw new BadRequestException('Cannot broadcast an inactive job alert');
    }

    const result = await this.notifyEndUsers({
      contentType: BroadcastContentType.JOB_ALERT,
      jobAlertId: alert.id,
      title: alert.title,
      body: alert.description ?? undefined,
    });

    const updated = await this.prisma.jobAlert.update({
      where: { id },
      data: { broadcastAt: result.broadcastAt },
    });

    return { ...updated, ...result };
  }

  listForUser(userId: string) {
    return this.prisma.userBroadcast.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(userId: string, id: string) {
    const row = await this.prisma.userBroadcast.findFirst({
      where: { id, userId },
    });
    if (!row) throw new BadRequestException('Broadcast not found');

    return this.prisma.userBroadcast.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
