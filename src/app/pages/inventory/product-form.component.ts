import { Component, Inject, OnInit, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../core/domain/entities/product.entity';
import { CreateProductUseCase } from '../../core/application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../core/application/use-cases/update-product.use-case';
import { GetCategoriesUseCase } from '../../core/application/use-cases/get-categories.use-case';
import { lastValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CategoryFormDialogComponent } from './settings/categories/category-form-dialog.component';
import { Category } from '../../core/domain/entities/category.entity';
import { MatDialog } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ToastService } from '../../core/services/toast.service';


// ── Cross-field validator: minStock must not exceed maxStock ─────────────
function stockRangeValidator(group: AbstractControl): ValidationErrors | null {
    const min = group.get('minStock')?.value;
    const max = group.get('maxStock')?.value;
    if (min !== null && max !== null && min > max) {
        group.get('minStock')?.setErrors({ minGreaterThanMax: true });
        group.get('maxStock')?.setErrors({ maxLessThanMin: true });
        return { stockRange: true };
    }
    // Clear cross-field errors (keep other errors intact)
    const minCtrl = group.get('minStock');
    const maxCtrl = group.get('maxStock');
    if (minCtrl?.hasError('minGreaterThanMax')) {
        const { minGreaterThanMax, ...rest } = minCtrl.errors!;
        minCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    if (maxCtrl?.hasError('maxLessThanMin')) {
        const { maxLessThanMin, ...rest } = maxCtrl.errors!;
        maxCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
}

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
        .category-chip-list {
            width: 100%;
        }
    `]
})
export class ProductFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private createProductUseCase = inject(CreateProductUseCase);
    private updateProductUseCase = inject(UpdateProductUseCase);
    private getCategoriesUseCase = inject(GetCategoriesUseCase);
    private dialog = inject(MatDialog);

    protected productForm: FormGroup;
    protected isEdit = false;
    protected categoryControl = new FormControl('');
    protected separatorKeysCodes: number[] = [ENTER, COMMA];
    private debouncedSearch = signal('');

    @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;

    // Real list of categories
    protected availableCategories = signal<Category[]>([]);

    protected filteredCategories = computed(() => {
        const search = this.debouncedSearch().toLowerCase();
        return this.availableCategories().filter(cat =>
            cat.name.toLowerCase().includes(search) &&
            !this.selectedCategories().some(sc => sc.id === cat.id)
        );
    });

    protected selectedCategories = signal<Category[]>([]);

    constructor(
        public dialogRef: MatDialogRef<ProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Product
    ) {
        this.isEdit = !!data;
        this.selectedCategories.set(data?.categories || []);

        this.productForm = this.fb.group({
            id: [data?.id || null],
            sku: [{ value: data?.sku || '', disabled: this.isEdit }, [Validators.required]],
            name: [data?.name || '', [Validators.required]],
            description: [data?.description || ''],
            stock: [data?.stock ?? null, [Validators.required, Validators.min(0)]],
            minStock: [data?.minStock ?? null, [Validators.min(0)]],
            maxStock: [data?.maxStock ?? null, [Validators.min(0)]],
            categoryIds: [this.selectedCategories().map(c => c.id)],
        }, { validators: stockRangeValidator });
    }

    async ngOnInit(): Promise<void> {
        this.categoryControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            if (typeof value === 'string') {
                this.debouncedSearch.set(value);
            } else if (value && (value as Category).name) {
                this.debouncedSearch.set((value as Category).name);
            } else {
                this.debouncedSearch.set('');
            }
        });

        await this.loadCategories();
    }

    private async loadCategories() {
        try {
            const categories = await lastValueFrom(this.getCategoriesUseCase.execute());
            this.availableCategories.set(categories);
        } catch (err) {
            this.toast.error('Error al cargar las categorías');
        }
    }

    protected add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (value) {
            const existing = this.availableCategories().find(c => c.name.toLowerCase() === value.toLowerCase());
            if (existing) {
                this.addCategory(existing);
            }
        }
        event.chipInput!.clear();
        this.categoryControl.setValue(null);
    }

    protected remove(category: Category): void {
        this.selectedCategories.update(cats => {
            const index = cats.findIndex(c => c.id === category.id);
            if (index >= 0) {
                cats.splice(index, 1);
                return [...cats];
            }
            return cats;
        });
        this.updateFormCategories();
    }

    protected selected(event: MatAutocompleteSelectedEvent): void {
        this.addCategory(event.option.value);
        if (this.categoryInput) {
            this.categoryInput.nativeElement.value = '';
        }
        this.categoryControl.setValue(null);
    }

    private addCategory(category: Category): void {
        if (!this.selectedCategories().some(c => c.id === category.id)) {
            this.selectedCategories.update(cats => [...cats, category]);
            this.updateFormCategories();
        }
    }

    private updateFormCategories() {
        this.productForm.get('categoryIds')?.setValue(this.selectedCategories().map(c => c.id));
        this.productForm.get('categoryIds')?.markAsDirty();
    }

    displayCategory(category: Category): string {
        return category && category.name ? category.name : '';
    }

    protected async onSubmit() {
        if (this.productForm.valid) {
            const { id, ...rest } = this.productForm.getRawValue();

            // Strip null/undefined so optional fields are omitted from the request body
            const payload = Object.fromEntries(
                Object.entries(rest).filter(([, v]) => v !== null && v !== undefined)
            );

            try {
                if (this.isEdit) {
                    await lastValueFrom(this.updateProductUseCase.execute({ id, ...payload } as any));
                    this.toast.success('Producto actualizado correctamente');
                } else {
                    await lastValueFrom(this.createProductUseCase.execute(payload));
                    this.toast.success('Producto creado correctamente');
                }
                this.dialogRef.close(true);
            } catch (err: any) {
                const status = err?.status;
                const errorCode = err?.error?.message?.errorCode ?? err?.error?.errorCode;

                if (status === 409 && errorCode === 'PRODUCT_SKU_DUPLICATE') {
                    // Mark SKU field as invalid inline — no toast
                    this.productForm.get('sku')?.setErrors({ duplicate: true });
                    this.productForm.get('sku')?.markAsTouched();
                } else {
                    const msg = err?.error?.message
                        ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
                        : 'Ocurrió un error al guardar el producto';
                    this.toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
                }
            }
        }
    }

    protected onCancel() {
        this.dialogRef.close();
    }

    protected addNewCategory() {
        const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
            width: '400px',
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.loadCategories();
            }
        });
    }
}
