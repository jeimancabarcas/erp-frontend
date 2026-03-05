import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingPaymentMethod } from '../../../../core/domain/entities/billing-payment-method.entity';
import { CreateBillingPaymentMethodUseCase } from '../../../../core/application/use-cases/create-billing-payment-method.use-case';
import { UpdateBillingPaymentMethodUseCase } from '../../../../core/application/use-cases/update-billing-payment-method.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-billing-payment-method-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    TablerIconsModule
  ],
  templateUrl: './billing-payment-method-form.component.html',
  styles: ``
})
export class BillingPaymentMethodFormComponent {
  paymentMethodForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  private createUseCase = inject(CreateBillingPaymentMethodUseCase);
  private updateUseCase = inject(UpdateBillingPaymentMethodUseCase);
  private toast = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BillingPaymentMethodFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BillingPaymentMethod | undefined
  ) {
    this.isEditMode = !!data;
    this.paymentMethodForm = this.fb.group({
      name: [data?.name || '', [Validators.required]],
      details: [data?.details || ''],
      status: [data?.status ?? true]
    });
  }

  onSubmit() {
    if (this.paymentMethodForm.invalid) {
      this.toast.error('Por favor, completa los campos requeridos correctamente.');
      return;
    }

    this.isLoading = true;
    const formValue = this.paymentMethodForm.value;

    const paymentMethodPayload: Partial<BillingPaymentMethod> = {
      name: formValue.name,
      details: formValue.details || null,
      status: formValue.status
    };

    if (this.isEditMode && this.data?.id) {
      this.updateUseCase.execute(this.data.id, paymentMethodPayload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (res) => {
            this.toast.success('Medio de pago actualizado con éxito');
            this.dialogRef.close(res);
          },
          error: (err) => {
            console.error(err);
            this.toast.error('Ocurrió un error al actualizar el medio de pago');
          }
        });
    } else {
      this.createUseCase.execute(paymentMethodPayload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (res) => {
            this.toast.success('Medio de pago creado con éxito');
            this.dialogRef.close(res);
          },
          error: (err) => {
            console.error(err);
            this.toast.error('Ocurrió un error al crear el medio de pago');
          }
        });
    }
  }
}
