import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
        return this.http.get<BillingPaymentTerm[]>(this.apiUrl);
    }
}
