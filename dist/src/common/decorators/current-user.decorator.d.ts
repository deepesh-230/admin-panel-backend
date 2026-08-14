export type AuthUser = {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    stateId?: string | null;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
