import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentFrequencyRepository } from '../../domain/repositories/billing-payment-frequency.repository';
import { HttpBillingPaymentFrequencyRepository } from '../../infrastructure/repositories/http-billing-payment-frequency.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingPaymentFrequencyUseCase {
    private repository: BillingPaymentFrequencyRepository = inject(HttpBillingPaymentFrequencyRepository);

    execute(id: string): Observable<void> {
        return this.repository.delete(id);
    }
}
