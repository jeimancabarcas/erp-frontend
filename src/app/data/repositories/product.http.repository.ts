import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../../core/domain/entities/product.entity';
import { ProductRepository } from '../../core/domain/repositories/product.repository';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/interfaces/api-response.interface';

const BASE_URL = `${environment.apiBaseUrl}/inventory/products`;

@Injectable({ providedIn: 'root' })
export class ProductHttpRepository extends ProductRepository {
    private http = inject(HttpClient);

    getProducts(): Observable<Product[]> {
        return this.http
            .get<ApiResponse<Product[]>>(BASE_URL)
            .pipe(map((res) => res.data));
    }

    getProductById(id: string): Observable<Product> {
        return this.http
            .get<ApiResponse<Product>>(`${BASE_URL}/${id}`)
            .pipe(map((res) => res.data));
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http
            .post<ApiResponse<Product>>(BASE_URL, product)
            .pipe(map((res) => res.data));
    }

    updateProduct(product: Product): Observable<Product> {
        return this.http
            .put<ApiResponse<Product>>(`${BASE_URL}/${product.id}`, product)
            .pipe(map((res) => res.data));
    }

    deleteProduct(id: string): Observable<void> {
        return this.http
            .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
            .pipe(map(() => undefined));
    }
}
