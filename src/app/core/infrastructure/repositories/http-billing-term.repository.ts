import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BillingPaymentTerm } from '../../domain/entities/billing-payment-term.entity';
import { BillingPaymentTermRepository } from '../../domain/repositories/billing-payment-term.repository';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingPaymentTermRepository extends BillingPaymentTermRepository {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/billing-payment-terms`;

    getAll(): Observable<BillingPaymentTerm[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    create(term: Partial<BillingPaymentTerm>): Observable<BillingPaymentTerm> {
        return this.http.post<any>(this.apiUrl, term).pipe(
            map(response => response.data)
        );
    }

    update(id: string, term: Partial<BillingPaymentTerm>): Observable<BillingPaymentTerm> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, term).pipe(
            map(response => response.data)
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
