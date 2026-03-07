import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BillingPaymentFrequency } from '../../domain/entities/billing-payment-frequency.entity';
import { BillingPaymentFrequencyRepository } from '../../domain/repositories/billing-payment-frequency.repository';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingPaymentFrequencyRepository extends BillingPaymentFrequencyRepository {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/billing-payment-frequencies`;

    getAll(): Observable<BillingPaymentFrequency[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    create(frequency: Partial<BillingPaymentFrequency>): Observable<BillingPaymentFrequency> {
        return this.http.post<any>(this.apiUrl, frequency).pipe(
            map(response => response.data)
        );
    }

    update(id: string, frequency: Partial<BillingPaymentFrequency>): Observable<BillingPaymentFrequency> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, frequency).pipe(
            map(response => response.data)
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
