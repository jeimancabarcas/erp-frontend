import { Observable } from 'rxjs';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DeleteProductUseCase {
    private repository = inject(ProductRepository);

    execute(id: string): Observable<void> {
        return this.repository.deleteProduct(id);
    }
}
