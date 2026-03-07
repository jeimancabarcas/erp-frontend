import { Observable } from 'rxjs';
import { BillingPaymentFrequency } from '../entities/billing-payment-frequency.entity';

export abstract class BillingPaymentFrequencyRepository {
    abstract getAll(): Observable<BillingPaymentFrequency[]>;
}
