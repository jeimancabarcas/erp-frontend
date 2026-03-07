import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingPaymentFrequency } from '../../../../core/domain/entities/billing-payment-frequency.entity';
import { CreateBillingPaymentFrequencyUseCase } from '../../../../core/application/use-cases/create-billing-payment-frequency.use-case';
import { UpdateBillingPaymentFrequencyUseCase } from '../../../../core/application/use-cases/update-billing-payment-frequency.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-payment-frequency-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TablerIconsModule
    ],
    templateUrl: './payment-frequency-form.component.html',
    styles: ``
})
export class PaymentFrequencyFormComponent {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    private createUseCase = inject(CreateBillingPaymentFrequencyUseCase);
    private updateUseCase = inject(UpdateBillingPaymentFrequencyUseCase);
    private toast = inject(ToastService);

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PaymentFrequencyFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BillingPaymentFrequency | undefined
    ) {
        this.isEditMode = !!data;
        this.form = this.fb.group({
            name: [data?.name || '', [Validators.required]],
            days: [data?.days || 0, [Validators.required, Validators.min(1)]]
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.toast.error('Por favor, completa los campos requeridos correctamente.');
            return;
        }

        this.isLoading = true;
        const formValue = this.form.value;

        const payload: Partial<BillingPaymentFrequency> = {
            name: formValue.name,
            days: formValue.days,
        };

        if (this.isEditMode && this.data?.id) {
            this.updateUseCase.execute(this.data.id, payload)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (res) => {
                        this.toast.success('Frecuencia actualizada con éxito');
                        this.dialogRef.close(res);
                    },
                    error: (err) => {
                        console.error(err);
                        this.toast.error('Ocurrió un error al actualizar la frecuencia');
                    }
                });
        } else {
            this.createUseCase.execute(payload)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (res) => {
                        this.toast.success('Frecuencia creada con éxito');
                        this.dialogRef.close(res);
                    },
                    error: (err) => {
                        console.error(err);
                        this.toast.error('Ocurrió un error al crear la frecuencia');
                    }
                });
        }
    }
}
