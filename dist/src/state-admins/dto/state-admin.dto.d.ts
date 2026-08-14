export declare class CreateStateAdminDto {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    stateId: string;
}
export declare class UpdateStateAdminDto {
    name?: string;
    phone?: string;
    stateId?: string;
    isActive?: boolean;
    password?: string;
}
