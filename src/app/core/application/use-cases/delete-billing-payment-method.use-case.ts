import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentMethodRepository } from '../../domain/repositories/billing-payment-method.repository';
import { HttpBillingPaymentMethodRepository } from '../../infrastructure/repositories/http-billing-payment-method.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingPaymentMethodUseCase {
    private repository: BillingPaymentMethodRepository = inject(HttpBillingPaymentMethodRepository);

    execute(id: string): Observable<void> {
        return this.repository.deletePaymentMethod(id);
    }
}
