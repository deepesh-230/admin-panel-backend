import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    upload(file: Express.Multer.File): Promise<{
        filename: string;
        url: string;
    }>;
}
