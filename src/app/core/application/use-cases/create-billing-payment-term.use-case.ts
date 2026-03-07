import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentTerm } from '../../domain/entities/billing-payment-term.entity';
import { BillingPaymentTermRepository } from '../../domain/repositories/billing-payment-term.repository';
import { HttpBillingPaymentTermRepository } from '../../infrastructure/repositories/http-billing-term.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateBillingPaymentTermUseCase {
    private repository: BillingPaymentTermRepository = inject(HttpBillingPaymentTermRepository);

    execute(term: Partial<BillingPaymentTerm>): Observable<BillingPaymentTerm> {
        return this.repository.create(term);
    }
}
