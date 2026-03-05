import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingTax } from '../../domain/entities/billing-tax.entity';
import { BillingTaxRepository } from '../../domain/repositories/billing-tax.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingTaxRepository implements BillingTaxRepository {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/billing-taxes`;

    getTaxes(): Observable<BillingTax[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    createTax(tax: Partial<BillingTax>): Observable<BillingTax> {
        return this.http.post<any>(this.apiUrl, tax).pipe(
            map(response => response.data)
        );
    }

    updateTax(id: string, tax: Partial<BillingTax>): Observable<BillingTax> {
        return this.http.patch<any>(`${this.apiUrl}/${id}`, tax).pipe(
            map(response => response.data)
        );
    }

    deleteTax(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
