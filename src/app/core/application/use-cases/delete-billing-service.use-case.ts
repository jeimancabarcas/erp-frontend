import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBillingServiceRepository } from '../../infrastructure/repositories/http-billing-service.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingServiceUseCase {
    private readonly repository = inject(HttpBillingServiceRepository);

    execute(id: string): Observable<void> {
        return this.repository.deleteService(id);
    }
}
