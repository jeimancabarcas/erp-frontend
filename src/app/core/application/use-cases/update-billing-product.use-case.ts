import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingProduct } from '../../domain/entities/billing-product.entity';
import { BillingProductRepository } from '../../domain/repositories/billing-product.repository';

@Injectable({
    providedIn: 'root'
})
export class UpdateBillingProductUseCase {
    private repository = inject(BillingProductRepository);

    execute(id: string, product: Partial<BillingProduct>): Observable<BillingProduct> {
        return this.repository.update(id, product);
    }
}
