import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingPaymentMethod } from '../../domain/entities/billing-payment-method.entity';
import { BillingPaymentMethodRepository } from '../../domain/repositories/billing-payment-method.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingPaymentMethodRepository implements BillingPaymentMethodRepository {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/billing-payment-methods`;

    getPaymentMethods(): Observable<BillingPaymentMethod[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    createPaymentMethod(paymentMethod: Partial<BillingPaymentMethod>): Observable<BillingPaymentMethod> {
        return this.http.post<any>(this.apiUrl, paymentMethod).pipe(
            map(response => response.data)
        );
    }

    updatePaymentMethod(id: string, paymentMethod: Partial<BillingPaymentMethod>): Observable<BillingPaymentMethod> {
        return this.http.patch<any>(`${this.apiUrl}/${id}`, paymentMethod).pipe(
            map(response => response.data)
        );
    }

    deletePaymentMethod(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
