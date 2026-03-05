import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingClient } from '../../../domain/entities/billing-client.entity';
import { BillingClientRepository } from '../../../domain/repositories/billing-client.repository';
import { HttpBillingClientRepository } from '../../../infrastructure/repositories/http-billing-client.repository';

@Injectable({
    providedIn: 'root'
})
export class UpdateBillingClientUseCase {
    private clientRepository: BillingClientRepository = inject(HttpBillingClientRepository);

    execute(id: string, updates: Partial<BillingClient>): Observable<BillingClient> {
        return this.clientRepository.update(id, updates);
    }
}
