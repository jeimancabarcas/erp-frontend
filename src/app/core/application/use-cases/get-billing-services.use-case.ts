import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingService } from '../../domain/entities/billing-service.entity';
import { HttpBillingServiceRepository } from '../../infrastructure/repositories/http-billing-service.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingServicesUseCase {
    private readonly repository = inject(HttpBillingServiceRepository);

    execute(): Observable<BillingService[]> {
        return this.repository.getServices();
    }
}
