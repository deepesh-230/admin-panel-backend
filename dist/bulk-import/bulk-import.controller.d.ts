import type { AuthUser } from '../common/decorators/current-user.decorator';
import { BulkImportService } from './bulk-import.service';
import type { BulkImportEntity } from './bulk-import.types';
import { BulkImportDto } from './dto/bulk-import.dto';
export declare class BulkImportController {
    private readonly bulkImportService;
    constructor(bulkImportService: BulkImportService);
    getTemplate(entity: BulkImportEntity): {
        columns: string[];
        sample: string[];
    };
    import(dto: BulkImportDto, user: AuthUser): Promise<import("./bulk-import.types").BulkImportResult>;
}
