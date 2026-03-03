import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

import { Category } from '../../../../core/domain/entities/category.entity';
import { GetCategoriesUseCase } from '../../../../core/application/use-cases/get-categories.use-case';
import { CreateCategoryUseCase } from '../../../../core/application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../../../core/application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../../../core/application/use-cases/delete-category.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';

// Inline edit dialog
import { CategoryFormDialogComponent } from './category-form-dialog.component';

@Component({
    selector: 'app-categories',
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
    templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
    private getCategories = inject(GetCategoriesUseCase);
    private createCategory = inject(CreateCategoryUseCase);
    private updateCategory = inject(UpdateCategoryUseCase);
    private deleteCategory = inject(DeleteCategoryUseCase);
    private toast = inject(ToastService);
    private dialog = inject(MatDialog);
    private fb = inject(FormBuilder);

    protected isLoading = signal(false);
    protected categories = signal<Category[]>([]);
    protected displayedColumns = ['name', 'description', 'actions'];

    protected createForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        description: [''],
    });

    ngOnInit() { this.load(); }

    protected load() {
        this.isLoading.set(true);
        this.getCategories.execute().subscribe({
            next: (cats) => { this.categories.set(cats); this.isLoading.set(false); },
            error: () => { this.isLoading.set(false); },
        });
    }

    protected async onCreate() {
        if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
        try {
            await lastValueFrom(this.createCategory.execute(this.createForm.value));
            this.toast.success('Categoría creada correctamente');
            this.createForm.reset();
            this.load();
        } catch (err: any) {
            const status = err?.status;
            const errorCode = err?.error?.message?.errorCode ?? err?.error?.errorCode;
            if (status === 409 && errorCode === 'CATEGORY_NAME_DUPLICATE') {
                this.createForm.get('name')?.setErrors({ duplicate: true });
                this.createForm.get('name')?.markAsTouched();
            } else {
                this.toast.error(err?.error?.message ?? 'Error al crear la categoría');
            }
        }
    }

    protected openEdit(category: Category) {
        const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
            width: '400px',
            data: category,
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.load();
        });
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
