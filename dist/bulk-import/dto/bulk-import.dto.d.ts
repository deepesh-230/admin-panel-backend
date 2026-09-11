import { BULK_IMPORT_ENTITIES } from '../bulk-import.types';
export declare class BulkImportDto {
    entity: (typeof BULK_IMPORT_ENTITIES)[number];
    rows: Record<string, string>[];
    dryRun?: boolean;
    categoryId?: string;
    subcategoryId?: string;
}
