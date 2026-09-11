import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
type JwtPayload = {
    sub: string;
    email: string;
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.RoleName;
        stateId: string | null;
        permissions: string[];
    } | null>;
}
export {};
