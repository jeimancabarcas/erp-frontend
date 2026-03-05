export interface BillingClient {
    id: string;
    documentType: string;
    documentNumber: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
