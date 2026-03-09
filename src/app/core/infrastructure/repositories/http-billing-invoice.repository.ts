import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BillingInvoice } from '../../domain/entities/billing-invoice.entity';
import { BillingInvoiceRepository } from '../../domain/repositories/billing-invoice.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingInvoiceRepository extends BillingInvoiceRepository {
    private readonly apiUrl = `${environment.apiUrl}/billing-invoices`;

    constructor(private readonly http: HttpClient) {
        super();
    }

    save(invoice: BillingInvoice): Observable<BillingInvoice> {
        return this.http.post<any>(this.apiUrl, invoice).pipe(
            map(response => response.data)
        );
    }

    findAll(): Observable<BillingInvoice[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    findById(id: string): Observable<BillingInvoice> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
