import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingService } from '../../../../core/domain/entities/billing-service.entity';
import { CreateBillingServiceUseCase } from '../../../../core/application/use-cases/create-billing-service.use-case';
import { UpdateBillingServiceUseCase } from '../../../../core/application/use-cases/update-billing-service.use-case';
import { GetBillingTaxesUseCase } from '../../../../core/application/use-cases/get-billing-taxes.use-case';
import { BillingTax } from '../../../../core/domain/entities/billing-tax.entity';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-billing-service-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        TablerIconsModule
    ],
    templateUrl: './billing-service-form.component.html',
})
export class BillingServiceFormComponent implements OnInit {
    public form: FormGroup;
    public isEditMode = false;

    // Dependencies
    private fb = inject(FormBuilder);
    private createBillingServiceUseCase = inject(CreateBillingServiceUseCase);
    private updateBillingServiceUseCase = inject(UpdateBillingServiceUseCase);
    private getTaxesUseCase = inject(GetBillingTaxesUseCase);
    private toast = inject(ToastService);

    public taxes = signal<BillingTax[]>([]);

    constructor(
        public dialogRef: MatDialogRef<BillingServiceFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: BillingService
    ) {
        this.isEditMode = !!(data && data.id);

        this.form = this.fb.group({
            standardCode: [data?.standardCode || ''],
            internalCode: [data?.internalCode || '', [Validators.required]],
            name: [data?.name || '', [Validators.required]],
            price: [data?.price ?? '', [Validators.required, Validators.min(0)]],
            taxes: this.fb.array([], [this.duplicateTaxValidator()])
        });

        // Initialize taxes in edit mode
        if (this.isEditMode && data?.taxes) {
            data.taxes.forEach(t => {
                this.addTax(t.taxId, t.rate);
            });
        } else if (!this.isEditMode) {
            this.addTax(); // Add one empty row by default for new services
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

        taxGroup.get('taxId')?.valueChanges.subscribe(() => {
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
            // Re-validate all current tax rows
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
                const errors = { ...rateControl.errors };
                delete errors['maxTaxRate'];
                rateControl.setErrors(Object.keys(errors).length ? errors : null);
            }
        }
    }

    public async onSubmit() {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.form.getRawValue();

        const payload: any = {
            id: this.isEditMode ? this.data?.id : undefined,
            name: formValue.name,
            price: Number(formValue.price),
            standardCode: formValue.standardCode,
            internalCode: formValue.internalCode,
            taxes: formValue.taxes.map((t: any) => ({
                serviceId: this.isEditMode ? this.data?.id : undefined,
                taxId: t.taxId,
                rate: Number(t.rate)
            }))
        };

        try {
            if (this.isEditMode && this.data?.id) {
                await new Promise((resolve, reject) => {
                    this.updateBillingServiceUseCase.execute(this.data!.id, payload).subscribe({
                        next: (res) => resolve(res),
                        error: (err) => reject(err)
                    });
                });
                this.toast.success('Servicio de facturación actualizado');
            } else {
                await new Promise((resolve, reject) => {
                    this.createBillingServiceUseCase.execute(payload as any).subscribe({
                        next: (res) => resolve(res),
                        error: (err) => reject(err)
                    });
                });
                this.toast.success('Servicio de facturación creado');
            }
            this.dialogRef.close(true);
        } catch (error) {
            this.toast.error('Ocurrió un error al guardar el servicio');
            console.error(error);
        }
    }
}
