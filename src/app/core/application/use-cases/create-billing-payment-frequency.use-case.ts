import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentFrequency } from '../../domain/entities/billing-payment-frequency.entity';
import { BillingPaymentFrequencyRepository } from '../../domain/repositories/billing-payment-frequency.repository';
import { HttpBillingPaymentFrequencyRepository } from '../../infrastructure/repositories/http-billing-payment-frequency.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateBillingPaymentFrequencyUseCase {
    private repository: BillingPaymentFrequencyRepository = inject(HttpBillingPaymentFrequencyRepository);

    execute(frequency: Partial<BillingPaymentFrequency>): Observable<BillingPaymentFrequency> {
        return this.repository.create(frequency);
    }
}
