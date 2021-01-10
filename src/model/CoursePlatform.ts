export type UserIdentifier = string|number

export interface CoursePlatform {
    verifyPurchase(userIdentifier: UserIdentifier): Promise<boolean>
}