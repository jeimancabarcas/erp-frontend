import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
        return this.http.get<BillingPaymentFrequency[]>(this.apiUrl);
    }
}
