import { Observable } from 'rxjs';
import { BillingPaymentTerm } from '../entities/billing-payment-term.entity';

export abstract class BillingPaymentTermRepository {
    abstract getAll(): Observable<BillingPaymentTerm[]>;
    abstract create(term: Partial<BillingPaymentTerm>): Observable<BillingPaymentTerm>;
    abstract update(id: string, term: Partial<BillingPaymentTerm>): Observable<BillingPaymentTerm>;
    abstract delete(id: string): Observable<void>;
}
