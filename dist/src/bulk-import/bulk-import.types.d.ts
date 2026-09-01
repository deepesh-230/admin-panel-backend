export declare const BULK_IMPORT_ENTITIES: readonly ["categories", "subcategories", "keywords", "service-providers", "marketplace-products", "volunteers", "faqs", "blogs", "job-alerts", "useful-links"];
export type BulkImportEntity = (typeof BULK_IMPORT_ENTITIES)[number];
export type BulkImportRowError = {
    row: number;
    message: string;
};
export type BulkImportResult = {
    dryRun: boolean;
    total: number;
    created: number;
    skipped: number;
    failed: number;
    errors: BulkImportRowError[];
};
