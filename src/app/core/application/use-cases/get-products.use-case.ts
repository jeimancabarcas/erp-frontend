import { Observable } from 'rxjs';
import { ProductRepository, ProductsQuery, ProductsListResponse } from '../../domain/repositories/product.repository';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GetProductsUseCase {
    private repository = inject(ProductRepository);

    execute(query?: ProductsQuery): Observable<ProductsListResponse> {
        return this.repository.getProducts(query);
    }
}
