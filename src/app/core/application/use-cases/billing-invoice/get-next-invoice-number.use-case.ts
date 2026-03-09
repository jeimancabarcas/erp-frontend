import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingInvoiceRepository } from '../../../domain/repositories/billing-invoice.repository';

@Injectable({
    providedIn: 'root'
})
export class GetNextInvoiceNumberUseCase {
    constructor(private repository: BillingInvoiceRepository) { }

    execute(): Observable<{ nextNumber: string }> {
        return this.repository.getNextNumber();
    }
}
