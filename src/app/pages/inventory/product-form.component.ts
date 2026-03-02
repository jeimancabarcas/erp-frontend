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
import { lastValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CategoryFormComponent } from './category-form.component';
import { MatDialog } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';


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
    private createProductUseCase = inject(CreateProductUseCase);
    private updateProductUseCase = inject(UpdateProductUseCase);
    private dialog = inject(MatDialog);

    protected productForm: FormGroup;
    protected isEdit = false;
    protected categoryControl = new FormControl('');
    protected separatorKeysCodes: number[] = [ENTER, COMMA];
    private debouncedSearch = signal('');

    @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;

    // Mock list of categories
    protected availableCategories = signal<string[]>(['Electronics', 'Computing', 'Accessories', 'Mobile', 'Graphics', 'Storage']);

    protected filteredCategories = computed(() => {
        const search = this.debouncedSearch().toLowerCase();
        return this.availableCategories().filter(cat =>
            cat.toLowerCase().includes(search) &&
            !this.selectedCategories().includes(cat)
        );
    });

    protected selectedCategories = signal<string[]>([]);

    constructor(
        public dialogRef: MatDialogRef<ProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Product
    ) {
        this.isEdit = !!data;
        this.selectedCategories.set(data?.categories || []);

        this.productForm = this.fb.group({
            id: [data?.id || null],
            sku: [data?.sku || '', [Validators.required]],
            name: [data?.name || '', [Validators.required]],
            description: [data?.description || ''],
            stock: [data?.stock ?? null, [Validators.required, Validators.min(0)]],
            minStock: [data?.minStock ?? null, [Validators.min(0)]],
            maxStock: [data?.maxStock ?? null, [Validators.min(0)]],
            categories: [this.selectedCategories(), [Validators.required, Validators.minLength(1)]],
        }, { validators: stockRangeValidator });

        // Initialize available categories if editing
        if (this.isEdit && data.categories) {
            data.categories.forEach(cat => {
                if (!this.availableCategories().includes(cat)) {
                    this.availableCategories.update(cats => [...cats, cat]);
                }
            });
        }
    }

    ngOnInit(): void {
        this.categoryControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.debouncedSearch.set(value || '');
        });
    }

    protected add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (value) {
            this.addCategory(value);
        }
        event.chipInput!.clear();
        this.categoryControl.setValue(null);
    }

    protected remove(category: string): void {
        this.selectedCategories.update(cats => {
            const index = cats.indexOf(category);
            if (index >= 0) {
                cats.splice(index, 1);
                return [...cats];
            }
            return cats;
        });
        this.updateFormCategories();
    }

    protected selected(event: MatAutocompleteSelectedEvent): void {
        this.addCategory(event.option.viewValue);
        this.categoryInput.nativeElement.value = '';
        this.categoryControl.setValue(null);
    }

    private addCategory(category: string): void {
        if (!this.selectedCategories().includes(category)) {
            this.selectedCategories.update(cats => [...cats, category]);
            if (!this.availableCategories().includes(category)) {
                this.availableCategories.update(cats => [...cats, category]);
            }
            this.updateFormCategories();
        }
    }

    private updateFormCategories() {
        this.productForm.get('categories')?.setValue(this.selectedCategories());
        this.productForm.get('categories')?.markAsDirty();
    }

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
                this.addCategory(newCategory.trim());
            }
        });
    }
}
