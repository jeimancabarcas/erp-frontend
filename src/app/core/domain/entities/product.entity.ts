export interface Product {
    id: string;          // UUID from backend
    sku?: string;
    name: string;
    description: string;
    stock: number;
    minStock?: number;
    maxStock?: number;
    categories: string[];
    createdAt?: string;
    updatedAt?: string;
}
