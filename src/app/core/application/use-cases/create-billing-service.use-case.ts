import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingService } from '../../domain/entities/billing-service.entity';
import { HttpBillingServiceRepository } from '../../infrastructure/repositories/http-billing-service.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateBillingServiceUseCase {
    private readonly repository = inject(HttpBillingServiceRepository);

    execute(service: Omit<BillingService, 'id' | 'createdAt' | 'updatedAt'>): Observable<BillingService> {
        return this.repository.createService(service);
    }
}
