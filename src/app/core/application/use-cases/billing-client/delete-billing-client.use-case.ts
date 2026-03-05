import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingClientRepository } from '../../../domain/repositories/billing-client.repository';
import { HttpBillingClientRepository } from '../../../infrastructure/repositories/http-billing-client.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingClientUseCase {
    private clientRepository: BillingClientRepository = inject(HttpBillingClientRepository);

    execute(id: string): Observable<void> {
        return this.clientRepository.delete(id);
    }
}
