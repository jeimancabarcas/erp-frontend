export interface BillingPaymentMethod {
    id: string;
    name: string;
    details: string | null;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
