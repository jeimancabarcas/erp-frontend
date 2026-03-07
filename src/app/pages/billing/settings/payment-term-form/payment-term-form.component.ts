import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingPaymentTerm } from '../../../../core/domain/entities/billing-payment-term.entity';
import { CreateBillingPaymentTermUseCase } from '../../../../core/application/use-cases/create-billing-payment-term.use-case';
import { UpdateBillingPaymentTermUseCase } from '../../../../core/application/use-cases/update-billing-payment-term.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-payment-term-form',
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
    templateUrl: './payment-term-form.component.html',
    styles: ``
})
export class PaymentTermFormComponent {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    private createUseCase = inject(CreateBillingPaymentTermUseCase);
    private updateUseCase = inject(UpdateBillingPaymentTermUseCase);
    private toast = inject(ToastService);

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PaymentTermFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BillingPaymentTerm | undefined
    ) {
        this.isEditMode = !!data;
        this.form = this.fb.group({
            name: [data?.name || '', [Validators.required]],
            days: [data?.days || 0, [Validators.required, Validators.min(0)]]
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.toast.error('Por favor, completa los campos requeridos correctamente.');
            return;
        }

        this.isLoading = true;
        const formValue = this.form.value;

        const payload: Partial<BillingPaymentTerm> = {
            name: formValue.name,
            days: formValue.days,
        };

        if (this.isEditMode && this.data?.id) {
            this.updateUseCase.execute(this.data.id, payload)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (res) => {
                        this.toast.success('Plazo actualizado con éxito');
                        this.dialogRef.close(res);
                    },
                    error: (err) => {
                        console.error(err);
                        this.toast.error('Ocurrió un error al actualizar el plazo');
                    }
                });
        } else {
            this.createUseCase.execute(payload)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (res) => {
                        this.toast.success('Plazo creado con éxito');
                        this.dialogRef.close(res);
                    },
                    error: (err) => {
                        console.error(err);
                        this.toast.error('Ocurrió un error al crear el plazo');
                    }
                });
        }
    }
}
