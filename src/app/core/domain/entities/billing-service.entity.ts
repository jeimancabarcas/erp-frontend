export interface BillingService {
    id: string;
    name: string;
    price: number;
    standardCode: string | null;
    internalCode: string;
    createdAt?: Date;
    updatedAt?: Date;
}
