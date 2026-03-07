import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentTerm } from '../../domain/entities/billing-payment-term.entity';
import { BillingPaymentTermRepository } from '../../domain/repositories/billing-payment-term.repository';
import { HttpBillingPaymentTermRepository } from '../../infrastructure/repositories/http-billing-term.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingPaymentTermsUseCase {
    private repository: BillingPaymentTermRepository = inject(HttpBillingPaymentTermRepository);

    execute(): Observable<BillingPaymentTerm[]> {
        return this.repository.getAll();
    }
}
