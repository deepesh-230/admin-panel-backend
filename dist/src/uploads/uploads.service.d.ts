import { ConfigService } from '@nestjs/config';
export declare class UploadsService {
    private readonly config;
    constructor(config: ConfigService);
    private uploadDir;
    private publicBaseUrl;
    saveImage(file: Express.Multer.File): Promise<{
        filename: string;
        url: string;
    }>;
}
