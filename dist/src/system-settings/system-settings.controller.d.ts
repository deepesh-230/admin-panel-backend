import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { SystemSettingsService } from './system-settings.service';
export declare class SystemSettingsController {
    private readonly systemSettings;
    constructor(systemSettings: SystemSettingsService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
    }[]>;
    update(dto: UpdateSystemSettingsDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
    }[]>;
    runLifecycle(): Promise<{
        deactivated: number;
        deleted: number;
        retentionMonths: number;
        cutoff: string;
    }>;
}
