import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { DashboardStats } from '../../domain/entities/dashboard-stats.entity';

@Injectable({ providedIn: 'root' })
export class GetDashboardStatsUseCase {
    private productRepository = inject(ProductRepository);

    execute(): Observable<DashboardStats> {
        return this.productRepository.getDashboardStats();
    }
}
