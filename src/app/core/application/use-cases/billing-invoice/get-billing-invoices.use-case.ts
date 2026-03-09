import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingInvoice } from '../../../domain/entities/billing-invoice.entity';
import { BillingInvoiceRepository } from '../../../domain/repositories/billing-invoice.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingInvoicesUseCase {
    constructor(
        @Inject(BillingInvoiceRepository)
        private readonly repository: BillingInvoiceRepository
    ) { }

    execute(): Observable<BillingInvoice[]> {
        return this.repository.findAll();
    }
}
