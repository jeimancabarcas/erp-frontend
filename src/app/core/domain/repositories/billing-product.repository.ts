import { Observable } from 'rxjs';
import { BillingProduct } from '../entities/billing-product.entity';

export abstract class BillingProductRepository {
    abstract create(product: Partial<BillingProduct>): Observable<BillingProduct>;
    abstract findAll(): Observable<BillingProduct[]>;
    abstract findById(id: string): Observable<BillingProduct>;
    abstract update(id: string, product: Partial<BillingProduct>): Observable<BillingProduct>;
    abstract delete(id: string): Observable<void>;
}
