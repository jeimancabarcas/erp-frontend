import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingService } from '../../../../core/domain/entities/billing-service.entity';
import { CreateBillingServiceUseCase } from '../../../../core/application/use-cases/create-billing-service.use-case';
import { UpdateBillingServiceUseCase } from '../../../../core/application/use-cases/update-billing-service.use-case';
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
    private toast = inject(ToastService);

    constructor(
        public dialogRef: MatDialogRef<BillingServiceFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: BillingService
    ) {
        this.isEditMode = !!(data && data.id);

        this.form = this.fb.group({
            standardCode: [data?.standardCode || ''],
            internalCode: [data?.internalCode || '', [Validators.required]],
            name: [data?.name || '', [Validators.required]],
            price: [data?.price ?? '', [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit() {
        // Initialization logic if any
    }

    public async onSubmit() {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.form.getRawValue();

        const payload: Partial<BillingService> = {
            standardCode: formValue.standardCode || null,
            internalCode: formValue.internalCode,
            name: formValue.name,
            price: Number(formValue.price)
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
