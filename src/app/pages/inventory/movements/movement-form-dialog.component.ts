import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CreateMovementUseCase } from '../../../core/application/use-cases/create-movement.use-case';
import { GetProductsUseCase } from '../../../core/application/use-cases/get-products.use-case';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/domain/entities/product.entity';

@Component({
    selector: 'app-movement-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MaterialModule, TranslateModule, TablerIconsModule],
    templateUrl: './movement-form-dialog.component.html'
})
export class MovementFormDialogComponent implements OnInit {
    private fb = inject(FormBuilder);
    private dialogRef = inject(MatDialogRef<MovementFormDialogComponent>);
    private createMovementUseCase = inject(CreateMovementUseCase);
    private getProductsUseCase = inject(GetProductsUseCase);
    private toast = inject(ToastService);

    protected movementForm: FormGroup;
    protected products = signal<Product[]>([]);
    protected isSubmitting = signal(false);
    protected selectedDirection = signal<'entrada' | 'salida'>('entrada');

    protected typeOptions = computed(() => {
        if (this.selectedDirection() === 'entrada') {
            return [
                { value: 'compra', label: 'Compra' },
                { value: 'manual', label: 'Manual' }
            ];
        } else {
            return [
                { value: 'venta', label: 'Venta' },
                { value: 'manual', label: 'Manual' }
            ];
        }
    });

    constructor() {
        this.movementForm = this.fb.group({
            date: [new Date().toISOString().substring(0, 16), [Validators.required]],
            productId: ['', [Validators.required]],
            direction: ['entrada', [Validators.required]],
            type: ['manual', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            reference: [''],
            notes: ['']
        });

        // Whenever direction changes, smartly adjust the type dropdown options or defaults
        this.movementForm.get('direction')?.valueChanges.subscribe(dir => {
            this.selectedDirection.set(dir);
            if (dir === 'entrada') this.movementForm.get('type')?.setValue('compra');
            if (dir === 'salida') this.movementForm.get('type')?.setValue('venta');
        });
    }

    ngOnInit() {
        // Load existing products to map in the select dropdown
        this.getProductsUseCase.execute().subscribe({
            next: (data) => this.products.set(data),
            error: () => this.toast.error('Error cargando los productos disponibles')
        });
    }

    protected onSubmit() {
        if (this.movementForm.invalid) return;

        this.isSubmitting.set(true);
        const formValue = this.movementForm.value;
        const payload = { ...formValue, date: new Date(formValue.date).toISOString() };

        this.createMovementUseCase.execute(payload).subscribe({
            next: () => {
                this.toast.success('Movimiento registrado exitosamente');
                this.dialogRef.close(true);
                this.isSubmitting.set(false);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const errorData = err.error;

                if (errorData?.errorCode === 'INSUFFICIENT_STOCK') {
                    this.movementForm.get('quantity')?.setErrors({
                        insufficientStock: { available: errorData.currentStock }
                    });
                    this.toast.error('Stock insuficiente para realizar esta salida');
                } else {
                    this.toast.error('Error al registrar el movimiento');
                }
            }
        });
    }

    protected onCancel() {
        this.dialogRef.close();
    }
}
