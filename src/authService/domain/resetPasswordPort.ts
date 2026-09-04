export interface ResetPasswordPort {
    resertPassword(token: string, password: string): Promise<ResetPasswordResponse>
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}
