import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../core/domain/entities/product.entity';
import { CreateProductUseCase } from '../../core/application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../core/application/use-cases/update-product.use-case';
import { lastValueFrom } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CategoryFormComponent } from './category-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        TranslateModule,
        TablerIconsModule,
    ],
    templateUrl: './product-form.component.html',
    styles: [`
        .select-header {
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
            padding: 8px 16px;
            border-bottom: 1px solid #efefef;
        }
        .select-footer {
            position: sticky;
            bottom: 0;
            background: white;
            z-index: 10;
            padding: 8px;
            border-top: 1px solid #efefef;
        }
        .search-field {
            width: 100%;
        }
        ::ng-deep .mat-mdc-select-panel {
            padding: 0px !important;
        }
    `]
})
export class ProductFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private createProductUseCase = inject(CreateProductUseCase);
    private updateProductUseCase = inject(UpdateProductUseCase);
    private dialog = inject(MatDialog);

    protected productForm: FormGroup;
    protected isEdit = false;
    protected searchControl = new FormControl('');

    // Mock list of categories - will be replaced by a service later
    protected availableCategories = signal<string[]>(['Electronics', 'Computing', 'Accessories', 'Mobile', 'Graphics', 'Storage']);

    protected filteredCategories = computed(() => {
        const search = this.searchControl.value?.toLowerCase() || '';
        return this.availableCategories().filter(cat => cat.toLowerCase().includes(search));
    });

    constructor(
        public dialogRef: MatDialogRef<ProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Product
    ) {
        this.isEdit = !!data;
        this.productForm = this.fb.group({
            id: [data?.id || null],
            name: [data?.name || '', [Validators.required]],
            description: [data?.description || ''],
            price: [data?.price || 0, [Validators.required, Validators.min(0)]],
            stock: [data?.stock || 0, [Validators.required, Validators.min(0)]],
            categories: [data?.categories || [], [Validators.required, Validators.minLength(1)]],
        });

        // If editing and there are categories not in the mock list, add them
        if (this.isEdit && data.categories) {
            data.categories.forEach(cat => {
                if (!this.availableCategories().includes(cat)) {
                    this.availableCategories.update(cats => [...cats, cat]);
                }
            });
        }
    }

    ngOnInit(): void { }

    protected async onSubmit() {
        if (this.productForm.valid) {
            const productData = this.productForm.value;
            if (this.isEdit) {
                await lastValueFrom(this.updateProductUseCase.execute(productData));
            } else {
                await lastValueFrom(this.createProductUseCase.execute(productData));
            }
            this.dialogRef.close(true);
        }
    }

    protected onCancel() {
        this.dialogRef.close();
    }

    protected addNewCategory() {
        const dialogRef = this.dialog.open(CategoryFormComponent, {
            width: '400px',
        });

        dialogRef.afterClosed().subscribe((newCategory: string) => {
            if (newCategory && newCategory.trim()) {
                const trimmed = newCategory.trim();
                if (!this.availableCategories().includes(trimmed)) {
                    this.availableCategories.update(cats => [...cats, trimmed]);
                }
                const currentSelected = this.productForm.get('categories')?.value || [];
                if (!currentSelected.includes(trimmed)) {
                    this.productForm.get('categories')?.setValue([...currentSelected, trimmed]);
                }
            }
        });
    }

    protected clearSearch(event: Event) {
        event.stopPropagation();
        this.searchControl.setValue('');
    }
}
