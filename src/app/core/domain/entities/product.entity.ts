export interface Product {
    id: number;
    sku?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    minStock?: number;
    maxStock?: number;
    categories: string[];
    imagePath?: string;
}
