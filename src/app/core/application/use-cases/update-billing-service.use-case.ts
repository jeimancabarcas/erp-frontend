import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingService } from '../../domain/entities/billing-service.entity';
import { HttpBillingServiceRepository } from '../../infrastructure/repositories/http-billing-service.repository';

@Injectable({
    providedIn: 'root'
})
export class UpdateBillingServiceUseCase {
    private readonly repository = inject(HttpBillingServiceRepository);

    execute(id: string, service: Partial<BillingService>): Observable<BillingService> {
        return this.repository.updateService(id, service);
    }
}
