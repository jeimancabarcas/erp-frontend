import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BillingProduct } from '../../../../core/domain/entities/billing-product.entity';
import { Product as InventoryProduct } from '../../../../core/domain/entities/product.entity';
import { GetProductsUseCase } from '../../../../core/application/use-cases/get-products.use-case';
import { CreateBillingProductUseCase } from '../../../../core/application/use-cases/create-billing-product.use-case';
import { UpdateBillingProductUseCase } from '../../../../core/application/use-cases/update-billing-product.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { BillingTax } from '../../../../core/domain/entities/billing-tax.entity';
import { GetBillingTaxesUseCase } from '../../../../core/application/use-cases/get-billing-taxes.use-case';

@Component({
    selector: 'app-billing-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        TablerIconsModule,
        MatSelectModule
    ],
    templateUrl: './billing-product-form.component.html',
})
export class BillingProductFormComponent implements OnInit {
    public form: FormGroup;
    public isEditMode = false;

    // Dependencies
    private fb = inject(FormBuilder);
    private getProductsUseCase = inject(GetProductsUseCase);
    private createBillingProductUseCase = inject(CreateBillingProductUseCase);
    private updateBillingProductUseCase = inject(UpdateBillingProductUseCase);
    private getTaxesUseCase = inject(GetBillingTaxesUseCase);
    private toast = inject(ToastService);

    // Business Data
    public taxes = signal<BillingTax[]>([]);

    // Table state for Inventory Picker
    public inventoryColumns = ['sku', 'name', 'select'];
    public filteredInventoryProducts = signal<InventoryProduct[]>([]);
    public isSearchingInventory = signal(false);
    public totalInventoryProducts = signal(0);
    public currentInventoryPage = signal(1);

    // UI states
    public selectedInventoryProduct = signal<InventoryProduct | null>(null);
    public showInventoryTable = signal(false);

    constructor(
        public dialogRef: MatDialogRef<BillingProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: BillingProduct
    ) {
        this.isEditMode = !!(data && data.id);

        this.form = this.fb.group({
            standardCode: [data?.standardCode || ''],
            internalCode: [{ value: data?.internalCode || (data?.inventoryProductId ? data.inventoryProduct?.sku : ''), disabled: this.isEditMode || !!data?.inventoryProductId }, [Validators.required]],
            name: [{ value: data?.name || (data?.inventoryProductId ? data.inventoryProduct?.name : ''), disabled: !!data?.inventoryProductId }, [Validators.required]],
            price: [data?.price ?? '', [Validators.required, Validators.min(0)]],
            taxes: this.fb.array([], [this.duplicateTaxValidator()]),
            inventoryProductId: [data?.inventoryProductId || null],
            inventorySearch: ['']
        });

        // Initialize selected product state from edit mode if present
        if (data?.inventoryProductId && data?.inventoryProduct) {
            this.selectedInventoryProduct.set({
                id: data.inventoryProductId,
                name: data.inventoryProduct.name,
                sku: data.inventoryProduct.sku,
            } as any);
        }

        // Handle Autocomplete Search
        this.form.get('inventorySearch')?.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(value => {
                if (typeof value === 'string' && value.trim().length > 0) {
                    this.searchInventoryProducts(value);
                } else if (typeof value === 'string') {
                    this.filteredInventoryProducts.set([]);
                }
            });

        // Initialize taxes in edit mode
        if (this.isEditMode && data?.taxes) {
            data.taxes.forEach(t => {
                this.addTax(t.taxId, t.rate);
            });
        } else if (!this.isEditMode) {
            this.addTax(); // Add one empty row by default for new products
        }
    }

    get taxesFormArray() {
        return this.form.get('taxes') as FormArray;
    }

    public addTax(taxId: string = '', rate: any = '') {
        const taxGroup = this.fb.group({
            taxId: [taxId, [Validators.required]],
            rate: [rate, [Validators.required, Validators.min(0)]]
        });

        // Watch for tax selection changes in this group to update max rate validation
        taxGroup.get('taxId')?.valueChanges.subscribe(id => {
            this.updateTaxRateValidators(taxGroup);
        });

        taxGroup.get('rate')?.valueChanges.subscribe(() => {
            this.updateTaxRateValidators(taxGroup);
        });

        this.taxesFormArray.push(taxGroup);
        if (taxId) {
            this.updateTaxRateValidators(taxGroup);
        }
    }

    public removeTax(index: number) {
        this.taxesFormArray.removeAt(index);
    }

    private duplicateTaxValidator() {
        return (control: AbstractControl) => {
            const formArray = control as FormArray;
            const taxIds = formArray.controls
                .map(c => c.get('taxId')?.value)
                .filter(id => !!id);

            const hasDuplicates = taxIds.some((id, index) => taxIds.indexOf(id) !== index);
            return hasDuplicates ? { duplicateTax: true } : null;
        };
    }

    ngOnInit() {
        this.loadTaxes();
    }

    private loadTaxes() {
        this.getTaxesUseCase.execute().subscribe(taxes => {
            this.taxes.set(taxes);
            // After loading taxes, re-validate all current tax rows
            this.taxesFormArray.controls.forEach(control => {
                this.updateTaxRateValidators(control as FormGroup);
            });
        });
    }

    private updateTaxRateValidators(taxGroup: FormGroup) {
        const taxId = taxGroup.get('taxId')?.value;
        const rateControl = taxGroup.get('rate');
        const selectedTax = this.taxes().find(t => t.id === taxId);

        if (selectedTax) {
            const maxRate = Number(selectedTax.rate);
            const currentRate = Number(rateControl?.value);

            if (currentRate > maxRate) {
                rateControl?.setErrors({ maxTaxRate: { max: maxRate, actual: currentRate } });
            } else if (rateControl?.hasError('maxTaxRate')) {
                // Temporarily clear only maxTaxRate error if present
                const errors = { ...rateControl.errors };
                delete errors['maxTaxRate'];
                rateControl.setErrors(Object.keys(errors).length ? errors : null);
            }
        }
    }

    public searchInventoryProducts(query: string = '', page: number = 1) {
        this.isSearchingInventory.set(true);
        this.currentInventoryPage.set(page);
        this.getProductsUseCase.execute({ search: query, limit: 5, page, excludeBillingLinked: true }).subscribe({
            next: (response) => {
                this.filteredInventoryProducts.set(response.products);
                this.totalInventoryProducts.set(response.total);
                this.isSearchingInventory.set(false);
            },
            error: () => {
                this.isSearchingInventory.set(false);
            }
        });
    }

    public onPageChange(event: PageEvent) {
        const query = this.form.get('inventorySearch')?.value || '';
        // event.pageIndex is 0-based, our API uses 1-based indexing
        this.searchInventoryProducts(query, event.pageIndex + 1);
    }

    public toggleInventoryTable() {
        this.showInventoryTable.set(!this.showInventoryTable());
        if (this.showInventoryTable() && this.filteredInventoryProducts().length === 0) {
            this.searchInventoryProducts(); // Load initial data
        }
    }

    public selectInventoryProduct(product: InventoryProduct) {
        this.selectedInventoryProduct.set(product);
        this.form.get('inventoryProductId')?.setValue(product.id);
        // Auto-fill and disable name and internal code
        this.form.get('name')?.setValue(product.name);
        this.form.get('name')?.disable();
        this.form.get('internalCode')?.setValue(product.sku);
        this.form.get('internalCode')?.disable();
        // Hide table upon selection
        this.showInventoryTable.set(false);
    }

    public unlinkInventoryProduct() {
        this.selectedInventoryProduct.set(null);
        this.form.get('inventoryProductId')?.setValue(null);
        this.form.get('name')?.enable();
        this.form.get('internalCode')?.setValue('');
        this.form.get('internalCode')?.enable();
        this.showInventoryTable.set(false);
    }

    public async onSubmit() {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.form.getRawValue();

        // Build payload mapping required types
        const payload: Partial<BillingProduct> & { id?: string } = {
            id: this.isEditMode ? this.data?.id : undefined,
            standardCode: formValue.standardCode,
            internalCode: formValue.inventoryProductId ? null : formValue.internalCode,
            name: formValue.inventoryProductId ? null : formValue.name,
            price: Number(formValue.price),
            taxes: formValue.taxes.map((t: any) => ({
                productId: this.isEditMode ? this.data?.id : undefined,
                taxId: t.taxId,
                rate: Number(t.rate)
            })),
            inventoryProductId: formValue.inventoryProductId || null,
        };

        try {
            if (this.isEditMode && this.data?.id) {
                await new Promise((resolve, reject) => {
                    this.updateBillingProductUseCase.execute(this.data!.id, payload).subscribe({
                        next: (res) => resolve(res),
                        error: (err) => reject(err)
                    });
                });
                this.toast.success('Producto de facturación actualizado');
            } else {
                await new Promise((resolve, reject) => {
                    this.createBillingProductUseCase.execute(payload).subscribe({
                        next: (res) => resolve(res),
                        error: (err) => reject(err)
                    });
                });
                this.toast.success('Producto de facturación creado');
            }
            this.dialogRef.close(true);
        } catch (error) {
            this.toast.error('Ocurrió un error al guardar el producto');
            console.error(error);
        }
    }
}
