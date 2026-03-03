import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../../core/domain/entities/category.entity';
import { CategoryRepository } from '../../core/domain/repositories/category.repository';
import { ApiResponse } from '../../core/interfaces/api-response.interface';
import { environment } from '../../../environments/environment';

const BASE_URL = `${environment.apiUrl}/inventory/categories`;

@Injectable({ providedIn: 'root' })
export class CategoryHttpRepository extends CategoryRepository {
    private http = inject(HttpClient);

    getCategories(): Observable<Category[]> {
        return this.http
            .get<ApiResponse<Category[]>>(BASE_URL)
            .pipe(map((r) => r.data));
    }

    createCategory(data: Partial<Category>): Observable<Category> {
        return this.http
            .post<ApiResponse<Category>>(BASE_URL, data)
            .pipe(map((r) => r.data));
    }

    updateCategory(category: Category): Observable<Category> {
        const { id, name, description } = category;
        return this.http
            .put<ApiResponse<Category>>(`${BASE_URL}/${id}`, { name, description })
            .pipe(map((r) => r.data));
    }

    deleteCategory(id: string): Observable<void> {
        return this.http
            .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
            .pipe(map(() => undefined));
    }
}
