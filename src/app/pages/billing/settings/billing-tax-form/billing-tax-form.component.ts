import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingTax } from '../../../../core/domain/entities/billing-tax.entity';
import { CreateBillingTaxUseCase } from '../../../../core/application/use-cases/create-billing-tax.use-case';
import { UpdateBillingTaxUseCase } from '../../../../core/application/use-cases/update-billing-tax.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-billing-tax-form',
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
  templateUrl: './billing-tax-form.component.html',
  styles: ``
})
export class BillingTaxFormComponent {
  taxForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  private createUseCase = inject(CreateBillingTaxUseCase);
  private updateUseCase = inject(UpdateBillingTaxUseCase);
  private toast = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BillingTaxFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BillingTax | undefined
  ) {
    this.isEditMode = !!data;
    this.taxForm = this.fb.group({
      name: [data?.name || '', [Validators.required]],
      rate: [data?.rate || 0, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.taxForm.invalid) {
      this.toast.error('Por favor, completa los campos requeridos correctamente.');
      return;
    }

    this.isLoading = true;
    const formValue = this.taxForm.value;

    const taxPayload: Partial<BillingTax> = {
      name: formValue.name,
      rate: formValue.rate,
    };

    if (this.isEditMode && this.data?.id) {
      this.updateUseCase.execute(this.data.id, taxPayload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (res) => {
            this.toast.success('Impuesto actualizado con éxito');
            this.dialogRef.close(res);
          },
          error: (err) => {
            console.error(err);
            this.toast.error('Ocurrió un error al actualizar el impuesto');
          }
        });
    } else {
      this.createUseCase.execute(taxPayload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (res) => {
            this.toast.success('Impuesto creado con éxito');
            this.dialogRef.close(res);
          },
          error: (err) => {
            console.error(err);
            this.toast.error('Ocurrió un error al crear el impuesto');
          }
        });
    }
  }
}
