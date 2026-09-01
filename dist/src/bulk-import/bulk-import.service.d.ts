import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import type { BulkImportEntity, BulkImportResult } from './bulk-import.types';
export declare class BulkImportService {
    private prisma;
    constructor(prisma: PrismaService);
    import(entity: BulkImportEntity, rows: Record<string, string>[], dryRun: boolean, currentUser: AuthUser, context?: {
        categoryId?: string;
        subcategoryId?: string;
    }): Promise<BulkImportResult>;
    private assertPermission;
    private importRow;
    private importCategory;
    private resolveCategoryId;
    private resolveSubcategoryId;
    private resolveStateId;
    private importSubcategory;
    private importKeyword;
    private importServiceProvider;
    private importMarketplaceProduct;
    private importVolunteer;
    private importCms;
    getTemplate(entity: BulkImportEntity): {
        columns: string[];
        sample: string[];
    };
}
