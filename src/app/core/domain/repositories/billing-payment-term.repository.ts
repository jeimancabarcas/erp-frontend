import { Observable } from 'rxjs';
import { BillingPaymentTerm } from '../entities/billing-payment-term.entity';

export abstract class BillingPaymentTermRepository {
    abstract getAll(): Observable<BillingPaymentTerm[]>;
}
