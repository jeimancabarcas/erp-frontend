import { Observable } from 'rxjs';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository, ProductsQuery } from '../../domain/repositories/product.repository';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GetProductsUseCase {
    private repository = inject(ProductRepository);

    execute(query?: ProductsQuery): Observable<Product[]> {
        return this.repository.getProducts(query);
    }
}
