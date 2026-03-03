import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../../core/domain/entities/product.entity';
import { ProductRepository, ProductsQuery } from '../../core/domain/repositories/product.repository';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/interfaces/api-response.interface';

const BASE_URL = `${environment.apiBaseUrl}/inventory/products`;

@Injectable({ providedIn: 'root' })
export class ProductHttpRepository extends ProductRepository {
    private http = inject(HttpClient);

    getProducts(query?: ProductsQuery): Observable<Product[]> {
        let params = new HttpParams();
        if (query?.search) params = params.set('search', query.search);
        if (query?.sortBy) params = params.set('sortBy', query.sortBy);
        if (query?.sortOrder) params = params.set('sortOrder', query.sortOrder);

        return this.http
            .get<ApiResponse<Product[]>>(BASE_URL, { params })
            .pipe(map((res) => res.data));
    }

    getProductById(id: string): Observable<Product> {
        return this.http
            .get<ApiResponse<Product>>(`${BASE_URL}/${id}`)
            .pipe(map((res) => res.data));
    }

    getStockAlerts(): Observable<any> {
        return this.http
            .get<ApiResponse<any>>(`${BASE_URL}/alerts`)
            .pipe(map((res) => res.data));
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http
            .post<ApiResponse<Product>>(BASE_URL, product)
            .pipe(map((res) => res.data));
    }

    updateProduct(product: Product): Observable<Product> {
        const { id, ...body } = product;
        return this.http
            .put<ApiResponse<Product>>(`${BASE_URL}/${id}`, body)
            .pipe(map((res) => res.data));
    }

    deleteProduct(id: string): Observable<void> {
        return this.http
            .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
            .pipe(map(() => undefined));
    }
}
