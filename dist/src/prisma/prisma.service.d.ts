import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    onModuleInit(): Promise<void>;
    private ensureSocialSettingTable;
    private ensureIndiaStates;
    private ensureCmsPages;
    private ensureSystemSettingTable;
    private ensurePaymentPlanTable;
    private ensureBecomeTables;
    private ensureBusinessVerificationColumns;
    private ensureHomeBannerTable;
    onModuleDestroy(): Promise<void>;
}
