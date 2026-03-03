import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable({ providedIn: 'root' })
export class CreateCategoryUseCase {
    private repo = inject(CategoryRepository);
    execute(data: Partial<Category>): Observable<Category> { return this.repo.createCategory(data); }
}
