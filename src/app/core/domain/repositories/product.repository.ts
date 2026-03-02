import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';

export abstract class ProductRepository {
    abstract getProducts(): Observable<Product[]>;
    abstract getProductById(id: number): Observable<Product>;
    abstract createProduct(product: Product): Observable<Product>;
    abstract updateProduct(product: Product): Observable<Product>;
    abstract deleteProduct(id: number): Observable<void>;
}
