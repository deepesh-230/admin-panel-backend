import { ConfigService } from '@nestjs/config';
export declare class UploadsService {
    private readonly config;
    private bucketReady;
    constructor(config: ConfigService);
    private supabaseUrl;
    private serviceRoleKey;
    private bucket;
    private uploadDir;
    private publicBaseUrl;
    private requireSupabase;
    private storageConfigured;
    private extFor;
    saveImage(file: Express.Multer.File): Promise<{
        filename: string;
        url: string;
    }>;
    private storageHeaders;
    private storageFetch;
    private errorMessage;
    private objectPath;
    private publicObjectUrl;
    private makeBucketPublic;
    private ensureBucket;
    private saveToSupabase;
    private saveToDisk;
}
