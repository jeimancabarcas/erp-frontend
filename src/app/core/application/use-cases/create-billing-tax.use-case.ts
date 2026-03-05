import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingTax } from '../../domain/entities/billing-tax.entity';
import { BillingTaxRepository } from '../../domain/repositories/billing-tax.repository';
import { HttpBillingTaxRepository } from '../../infrastructure/repositories/http-billing-tax.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateBillingTaxUseCase {
    private repository: BillingTaxRepository = inject(HttpBillingTaxRepository);

    execute(tax: Partial<BillingTax>): Observable<BillingTax> {
        return this.repository.createTax(tax);
    }
}
