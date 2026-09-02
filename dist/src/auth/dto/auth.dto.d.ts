export declare class RegisterDto {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    km?: number;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class ResetPasswordByOtpDto {
    email: string;
    otp: string;
    newPassword: string;
}
