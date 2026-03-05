import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingTax } from '../../domain/entities/billing-tax.entity';
import { BillingTaxRepository } from '../../domain/repositories/billing-tax.repository';
import { HttpBillingTaxRepository } from '../../infrastructure/repositories/http-billing-tax.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingTaxesUseCase {
    private repository: BillingTaxRepository = inject(HttpBillingTaxRepository);

    execute(): Observable<BillingTax[]> {
        return this.repository.getTaxes();
    }
}
