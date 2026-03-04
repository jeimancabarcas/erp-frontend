import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingProduct } from '../../domain/entities/billing-product.entity';
import { BillingProductRepository } from '../../domain/repositories/billing-product.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingProductsUseCase {
    private repository = inject(BillingProductRepository);

    execute(): Observable<BillingProduct[]> {
        return this.repository.findAll();
    }
}
