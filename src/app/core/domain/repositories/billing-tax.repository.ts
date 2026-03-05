import { Observable } from 'rxjs';
import { BillingTax } from '../entities/billing-tax.entity';

export abstract class BillingTaxRepository {
    abstract createTax(tax: Partial<BillingTax>): Observable<BillingTax>;
    abstract getTaxes(): Observable<BillingTax[]>;
    abstract updateTax(id: string, tax: Partial<BillingTax>): Observable<BillingTax>;
    abstract deleteTax(id: string): Observable<void>;
}
