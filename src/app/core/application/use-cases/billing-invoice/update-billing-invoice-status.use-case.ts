import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingInvoiceRepository } from '../../../domain/repositories/billing-invoice.repository';

@Injectable({
    providedIn: 'root'
})
export class UpdateBillingInvoiceStatusUseCase {
    constructor(private repository: BillingInvoiceRepository) { }

    execute(id: string, status: string): Observable<void> {
        return this.repository.updateStatus(id, status);
    }
}
