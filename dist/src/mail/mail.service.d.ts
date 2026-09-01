import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    isConfigured(): boolean;
    sendPasswordReset(to: string, resetUrl: string): Promise<{
        sent: false;
    } | {
        sent: true;
    }>;
}
