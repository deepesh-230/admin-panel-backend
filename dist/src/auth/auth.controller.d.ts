import type { Request } from 'express';
import { type AuthUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordByOtpDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private sessionMeta;
    register(dto: RegisterDto, req: Request): Promise<{
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
                digipin: string | null;
                pincode: string | null;
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
    login(dto: LoginDto, req: Request): Promise<{
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
                digipin: string | null;
                pincode: string | null;
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
    refresh(dto: RefreshTokenDto, req: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
        data: null;
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
    me(user: AuthUser): Promise<{
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
            digipin: string | null;
            pincode: string | null;
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
}
