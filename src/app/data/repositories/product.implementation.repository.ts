import { Observable, of, throwError } from 'rxjs';
import { Product } from '../../core/domain/entities/product.entity';
import { ProductRepository, ProductsListResponse, StockAlerts, ProductsQuery } from '../../core/domain/repositories/product.repository';
import { DashboardStats } from '../../core/domain/entities/dashboard-stats.entity';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProductImplementationRepository extends ProductRepository {
    private productsList: Product[] = [
        { id: '1', sku: 'LAP-PRO-01', name: 'Laptop Pro', description: 'High performance laptop', stock: 10, minStock: 5, maxStock: 20, categories: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', sku: 'SMA-X-01', name: 'Smartphone X', description: 'Latest model smartphone', stock: 25, minStock: 10, maxStock: 50, categories: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    getProducts(query?: ProductsQuery): Observable<ProductsListResponse> {
        return of({ products: [...this.productsList], total: this.productsList.length });
    }

    getStockAlerts(): Observable<StockAlerts> {
        return of({ outOfStockCount: 0, lowStockCount: 0, latestAlerts: [] });
    }

    getDashboardStats(): Observable<DashboardStats> {
        return of({} as DashboardStats);
    }

    getProductById(id: string): Observable<Product> {
        const product = this.productsList.find(p => p.id === id);
        return product ? of(product) : throwError(() => new Error('Product not found'));
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        const newProduct = { ...product, id: Math.random().toString() } as Product;
        this.productsList.push(newProduct);
        return of(newProduct);
    }

    updateProduct(product: Product): Observable<Product> {
        const index = this.productsList.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.productsList[index] = { ...product };
            return of(this.productsList[index]);
        }
        return throwError(() => new Error('Product not found'));
    }

    deleteProduct(id: string): Observable<void> {
        const index = this.productsList.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productsList.splice(index, 1);
            return of(undefined);
        }
        return throwError(() => new Error('Product not found'));
    }
}
