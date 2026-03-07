import { Observable } from 'rxjs';
import { BillingPaymentFrequency } from '../entities/billing-payment-frequency.entity';

export abstract class BillingPaymentFrequencyRepository {
    abstract getAll(): Observable<BillingPaymentFrequency[]>;
    abstract create(frequency: Partial<BillingPaymentFrequency>): Observable<BillingPaymentFrequency>;
    abstract update(id: string, frequency: Partial<BillingPaymentFrequency>): Observable<BillingPaymentFrequency>;
    abstract delete(id: string): Observable<void>;
}
