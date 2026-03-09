import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingInvoice } from '../../../domain/entities/billing-invoice.entity';
import { BillingInvoiceRepository } from '../../../domain/repositories/billing-invoice.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateBillingInvoiceUseCase {
    constructor(
        @Inject(BillingInvoiceRepository)
        private readonly repository: BillingInvoiceRepository
    ) { }

    execute(invoice: BillingInvoice): Observable<BillingInvoice> {
        return this.repository.save(invoice);
    }
}
