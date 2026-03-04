export interface BillingProduct {
    id: string;
    name: string;
    price: number;
    standardCode: string;
    internalCode?: string | null;
    inventoryProductId?: string | null;
    inventoryProduct?: {
        sku: string;
        name: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
