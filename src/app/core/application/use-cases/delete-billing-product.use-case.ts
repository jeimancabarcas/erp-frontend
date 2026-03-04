import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingProductRepository } from '../../domain/repositories/billing-product.repository';

@Injectable({
    providedIn: 'root'
})
export class DeleteBillingProductUseCase {
    private repository = inject(BillingProductRepository);

    execute(id: string): Observable<void> {
        return this.repository.delete(id);
    }
}
