import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

import { Category } from '../../../core/domain/entities/category.entity';
import { GetCategoriesUseCase } from '../../../core/application/use-cases/get-categories.use-case';
import { UpdateCategoryUseCase } from '../../../core/application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../../core/application/use-cases/delete-category.use-case';
import { ToastService } from '../../../core/services/toast.service';
import { TableLoadingComponent } from '../../../shared/components/table-loading/table-loading.component';
import { TableEmptyComponent } from '../../../shared/components/table-empty/table-empty.component';
import { CategoryFormDialogComponent } from './categories/category-form-dialog.component';

@Component({
    selector: 'app-inventory-settings',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        TablerIconsModule,
        TranslateModule,
        ReactiveFormsModule,
        TableLoadingComponent,
        TableEmptyComponent,
    ],
    templateUrl: './inventory-settings.component.html',
})
export class InventorySettingsComponent implements OnInit {
    private getCategories = inject(GetCategoriesUseCase);
    private deleteCategory = inject(DeleteCategoryUseCase);
    private toast = inject(ToastService);
    private dialog = inject(MatDialog);

    protected isLoading = signal(false);
    protected categories = signal<Category[]>([]);
    protected displayedColumns = ['name', 'description', 'actions'];

    ngOnInit() { this.load(); }

    protected load() {
        this.isLoading.set(true);
        this.getCategories.execute().subscribe({
            next: (cats: Category[]) => { this.categories.set(cats); this.isLoading.set(false); },
            error: () => { this.isLoading.set(false); },
        });
    }

    protected openCreate() {
        const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
            width: '400px',
            data: null,
        });
        dialogRef.afterClosed().subscribe((result: boolean) => { if (result) this.load(); });
    }

    protected openEdit(category: Category) {
        const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
            width: '400px',
            data: category,
        });
        dialogRef.afterClosed().subscribe((result: boolean) => { if (result) this.load(); });
    }

    protected async onDelete(id: string) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await lastValueFrom(this.deleteCategory.execute(id));
            this.toast.success('Categoría eliminada');
            this.load();
        } catch {
            this.toast.error('Error al eliminar la categoría');
        }
    }
}
