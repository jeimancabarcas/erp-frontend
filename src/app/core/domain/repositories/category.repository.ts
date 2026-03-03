import { Observable } from 'rxjs';
import { Category } from '../entities/category.entity';

export abstract class CategoryRepository {
    abstract getCategories(): Observable<Category[]>;
    abstract createCategory(data: Partial<Category>): Observable<Category>;
    abstract updateCategory(category: Category): Observable<Category>;
    abstract deleteCategory(id: string): Observable<void>;
}
