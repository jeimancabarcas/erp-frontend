import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingProduct } from '../../domain/entities/billing-product.entity';
import { BillingProductRepository } from '../../domain/repositories/billing-product.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingProductRepository extends BillingProductRepository {
    private apiUrl = `${environment.apiUrl}/billing-products`;

    constructor(private http: HttpClient) {
        super();
    }

    create(productData: Partial<BillingProduct>): Observable<BillingProduct> {
        return this.http.post<any>(this.apiUrl, productData).pipe(
            map(response => response.data)
        );
    }

    findAll(): Observable<BillingProduct[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    findById(id: string): Observable<BillingProduct> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }

    update(id: string, productData: Partial<BillingProduct>): Observable<BillingProduct> {
        return this.http.patch<any>(`${this.apiUrl}/${id}`, productData).pipe(
            map(response => response.data)
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
