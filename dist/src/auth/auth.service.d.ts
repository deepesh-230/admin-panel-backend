import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordByOtpDto, ResetPasswordDto } from './dto/auth.dto';
type SessionMeta = {
    userAgent?: string;
    ipAddress?: string;
};
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private mail;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, mail: MailService);
    private hashToken;
    private getRoleByName;
    private sanitizeUser;
    private userInclude;
    private issueTokens;
    register(dto: RegisterDto, meta?: SessionMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                email: string;
                name: string | null;
                phone: string | null;
                location: string | null;
                latitude: number | null;
                longitude: number | null;
                km: number | null;
                isActive: boolean;
                stateId: string | null;
                role: import("@prisma/client").$Enums.RoleName;
                permissions: string[];
                states: {
                    id: string;
                    name: string;
                    code: string | null;
                    isPrimary: boolean;
                }[];
            };
        };
    }>;
    login(dto: LoginDto, meta?: SessionMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                email: string;
                name: string | null;
                phone: string | null;
                location: string | null;
                latitude: number | null;
                longitude: number | null;
                km: number | null;
                isActive: boolean;
                stateId: string | null;
                role: import("@prisma/client").$Enums.RoleName;
                permissions: string[];
                states: {
                    id: string;
                    name: string;
                    code: string | null;
                    isPrimary: boolean;
                }[];
            };
        };
    }>;
    refresh(refreshToken: string, meta?: SessionMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(refreshToken?: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    me(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            name: string | null;
            phone: string | null;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            km: number | null;
            isActive: boolean;
            stateId: string | null;
            role: import("@prisma/client").$Enums.RoleName;
            permissions: string[];
            states: {
                id: string;
                name: string;
                code: string | null;
                isPrimary: boolean;
            }[];
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        data: {
            resetToken: string;
        } | null;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    resetPasswordByOtp(dto: ResetPasswordByOtpDto): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
export {};
