import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';

export interface ProductsQuery {
    search?: string;
    sortBy?: 'name' | 'sku' | 'stock' | 'minStock' | 'maxStock' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface StockAlerts {
    outOfStockCount: number;
    lowStockCount: number;
    latestAlerts: Product[];
}

export abstract class ProductRepository {
    abstract getProducts(query?: ProductsQuery): Observable<Product[]>;
    abstract getProductById(id: string): Observable<Product>;
    abstract getStockAlerts(): Observable<StockAlerts>;
    abstract createProduct(product: Partial<Product>): Observable<Product>;
    abstract updateProduct(product: Product): Observable<Product>;
    abstract deleteProduct(id: string): Observable<void>;
}
