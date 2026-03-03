import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable({ providedIn: 'root' })
export class GetCategoriesUseCase {
    private repo = inject(CategoryRepository);
    execute(): Observable<Category[]> { return this.repo.getCategories(); }
}
