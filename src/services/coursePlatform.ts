export interface AuthCredentials {
    apiKey: string;
}

export interface Options {
    email?: string
}

export interface ApiResponse {
    status?: boolean
}

export default abstract class CoursePlatformService<O extends Options, R extends ApiResponse> {
    public platformName = 'Course Platform';

    abstract authenticate(authCredentials: AuthCredentials): void;
    abstract getPurchases(options?: O): Promise<R>;
    abstract verifyUserPurchase(userEmail: string): Promise<boolean>;
    abstract confirmProduct(userEmail: string, plano: string): Promise<boolean>;
    abstract checkIfPaymentMethodIsBoleto(userEmail: string): Promise<boolean>;
}