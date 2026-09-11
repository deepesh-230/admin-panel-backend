import { NestExpressApplication } from '@nestjs/platform-express';
import type { Express } from 'express';
export declare function createNestApp(expressApp?: Express): Promise<{
    app: NestExpressApplication;
    expressApp: Express;
}>;
