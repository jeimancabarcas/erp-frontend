import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingTaxRepository } from '../../domain/repositories/billing-tax.repository';
import { HttpBillingTaxRepository } from '../../infrastructure/repositories/http-billing-tax.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingTaxUseCase {
    private repository: BillingTaxRepository = inject(HttpBillingTaxRepository);

    execute(id: string): Observable<void> {
        return this.repository.deleteTax(id);
    }
}
