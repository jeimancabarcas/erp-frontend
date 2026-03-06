export interface BillingService {
    id: string;
    name: string;
    price: number;
    standardCode: string | null;
    internalCode: string;
    taxes?: {
        taxId: string;
        rate: number;
        tax?: any;
    }[];
    createdAt?: Date;
    updatedAt?: Date;
}
