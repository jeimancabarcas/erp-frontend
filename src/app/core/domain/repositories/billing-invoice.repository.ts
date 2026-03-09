import { Observable } from 'rxjs';
import { BillingInvoice } from '../entities/billing-invoice.entity';

export abstract class BillingInvoiceRepository {
    abstract save(invoice: BillingInvoice): Observable<BillingInvoice>;
    abstract findAll(): Observable<BillingInvoice[]>;
    abstract findById(id: string): Observable<BillingInvoice>;
    abstract getNextNumber(): Observable<{ nextNumber: string }>;
}
