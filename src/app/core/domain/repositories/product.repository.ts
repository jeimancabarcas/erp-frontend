import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';
import { DashboardStats } from '../entities/dashboard-stats.entity';

export interface ProductsQuery {
    search?: string;
    sortBy?: 'name' | 'sku' | 'stock' | 'minStock' | 'maxStock' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ProductsListResponse {
    products: Product[];
    total: number;
}

export interface StockAlerts {
    outOfStockCount: number;
    lowStockCount: number;
    latestAlerts: Product[];
}

export abstract class ProductRepository {
    abstract getProducts(query?: ProductsQuery): Observable<ProductsListResponse>;
    abstract getProductById(id: string): Observable<Product>;
    abstract getStockAlerts(): Observable<StockAlerts>;
    abstract getDashboardStats(): Observable<DashboardStats>;
    abstract createProduct(product: Partial<Product>): Observable<Product>;
    abstract updateProduct(product: Product): Observable<Product>;
    abstract deleteProduct(id: string): Observable<void>;
}
