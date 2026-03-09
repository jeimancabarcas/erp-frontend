import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingInvoice } from '../../../domain/entities/billing-invoice.entity';
import { BillingInvoiceRepository } from '../../../domain/repositories/billing-invoice.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingInvoiceByIdUseCase {
    constructor(private readonly repository: BillingInvoiceRepository) { }

    execute(id: string): Observable<BillingInvoice> {
        return this.repository.findById(id);
    }
}
