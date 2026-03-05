import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingClient } from '../../../domain/entities/billing-client.entity';
import { BillingClientRepository } from '../../../domain/repositories/billing-client.repository';
import { HttpBillingClientRepository } from '../../../infrastructure/repositories/http-billing-client.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateBillingClientUseCase {
    private clientRepository: BillingClientRepository = inject(HttpBillingClientRepository);

    execute(clientData: Partial<BillingClient>): Observable<BillingClient> {
        return this.clientRepository.create(clientData);
    }
}
