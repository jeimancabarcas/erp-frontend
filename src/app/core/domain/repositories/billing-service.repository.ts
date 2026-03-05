import { Observable } from 'rxjs';
import { BillingService } from '../entities/billing-service.entity';

export interface BillingServiceRepository {
    getServices(): Observable<BillingService[]>;
    createService(service: Omit<BillingService, 'id' | 'createdAt' | 'updatedAt'>): Observable<BillingService>;
    updateService(id: string, service: Partial<BillingService>): Observable<BillingService>;
    deleteService(id: string): Observable<void>;
}
