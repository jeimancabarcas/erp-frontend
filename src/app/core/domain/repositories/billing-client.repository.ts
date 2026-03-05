import { Observable } from 'rxjs';
import { BillingClient } from '../entities/billing-client.entity';

export abstract class BillingClientRepository {
    abstract create(client: Partial<BillingClient>): Observable<BillingClient>;
    abstract findAll(): Observable<BillingClient[]>;
    abstract update(id: string, updates: Partial<BillingClient>): Observable<BillingClient>;
    abstract delete(id: string): Observable<void>;
}
