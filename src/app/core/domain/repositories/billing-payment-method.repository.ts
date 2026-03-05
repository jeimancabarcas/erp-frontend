import { Observable } from 'rxjs';
import { BillingPaymentMethod } from '../entities/billing-payment-method.entity';

export abstract class BillingPaymentMethodRepository {
    abstract createPaymentMethod(paymentMethod: Partial<BillingPaymentMethod>): Observable<BillingPaymentMethod>;
    abstract getPaymentMethods(): Observable<BillingPaymentMethod[]>;
    abstract updatePaymentMethod(id: string, paymentMethod: Partial<BillingPaymentMethod>): Observable<BillingPaymentMethod>;
    abstract deletePaymentMethod(id: string): Observable<void>;
}
