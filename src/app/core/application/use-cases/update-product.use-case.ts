import { Observable } from 'rxjs';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UpdateProductUseCase {
    private repository = inject(ProductRepository);

    execute(product: Product): Observable<Product> {
        return this.repository.updateProduct(product);
    }
}
