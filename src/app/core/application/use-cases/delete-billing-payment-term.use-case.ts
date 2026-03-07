import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentTermRepository } from '../../domain/repositories/billing-payment-term.repository';
import { HttpBillingPaymentTermRepository } from '../../infrastructure/repositories/http-billing-term.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingPaymentTermUseCase {
    private repository: BillingPaymentTermRepository = inject(HttpBillingPaymentTermRepository);

    execute(id: string): Observable<void> {
        return this.repository.delete(id);
    }
}
