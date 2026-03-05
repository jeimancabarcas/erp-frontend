import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingPaymentMethod } from '../../domain/entities/billing-payment-method.entity';
import { BillingPaymentMethodRepository } from '../../domain/repositories/billing-payment-method.repository';
import { HttpBillingPaymentMethodRepository } from '../../infrastructure/repositories/http-billing-payment-method.repository';

@Injectable({
    providedIn: 'root'
})
export class UpdateBillingPaymentMethodUseCase {
    private repository: BillingPaymentMethodRepository = inject(HttpBillingPaymentMethodRepository);

    execute(id: string, paymentMethod: Partial<BillingPaymentMethod>): Observable<BillingPaymentMethod> {
        return this.repository.updatePaymentMethod(id, paymentMethod);
    }
}
