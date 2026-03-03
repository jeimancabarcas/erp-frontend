import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRepository, StockAlerts } from '../../domain/repositories/product.repository';

@Injectable({ providedIn: 'root' })
export class GetStockAlertsUseCase {
    private repository = inject(ProductRepository);

    execute(): Observable<StockAlerts> {
        return this.repository.getStockAlerts();
    }
}
