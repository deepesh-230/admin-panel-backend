import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class SystemSettingsService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly logger;
    private lifecycleTimer;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    ensureDefaults(): Promise<void>;
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
    }[]>;
    getNumber(key: string, fallback: number): Promise<number>;
    getValue(key: string, fallback?: string): Promise<string>;
    updateMany(updates: {
        key: string;
        value: string;
    }[]): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
    }[]>;
    runJobAlertLifecycle(): Promise<{
        deactivated: number;
        deleted: number;
        retentionMonths: number;
        cutoff: string;
    }>;
    listPublicJobAlerts(): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        postDate: string | null;
        lastDate: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
        broadcastAt: Date | null;
    }[]>;
}
