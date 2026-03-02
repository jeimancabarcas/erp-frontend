import { Observable, of, throwError } from 'rxjs';
import { Product } from '../../core/domain/entities/product.entity';
import { ProductRepository } from '../../core/domain/repositories/product.repository';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProductImplementationRepository extends ProductRepository {
    private products: Product[] = [
        { id: 1, name: 'Laptop Pro', description: 'High performance laptop', price: 1500, stock: 10, categories: ['Electronics', 'Computing'] },
        { id: 2, name: 'Smartphone X', description: 'Latest model smartphone', price: 900, stock: 25, categories: ['Electronics', 'Mobile'] },
        { id: 3, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 30, stock: 50, categories: ['Accessories', 'Computing'] },
        { id: 4, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 120, stock: 15, categories: ['Accessories', 'Computing'] },
        { id: 5, name: 'Monitor 4K', description: '32-inch 4K monitor', price: 400, stock: 5, categories: ['Electronics', 'Graphics'] },
    ];

    getProducts(): Observable<Product[]> {
        return of([...this.products]);
    }

    getProductById(id: number): Observable<Product> {
        const product = this.products.find(p => p.id === id);
        return product ? of(product) : throwError(() => new Error('Product not found'));
    }

    createProduct(product: Product): Observable<Product> {
        const newProduct = { ...product, id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1 };
        this.products.push(newProduct);
        return of(newProduct);
    }

    updateProduct(product: Product): Observable<Product> {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.products[index] = { ...product };
            return of(this.products[index]);
        }
        return throwError(() => new Error('Product not found'));
    }

    deleteProduct(id: number): Observable<void> {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products.splice(index, 1);
            return of(undefined);
        }
        return throwError(() => new Error('Product not found'));
    }
}
