import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable({ providedIn: 'root' })
export class DeleteCategoryUseCase {
    private repo = inject(CategoryRepository);
    execute(id: string): Observable<void> { return this.repo.deleteCategory(id); }
}
