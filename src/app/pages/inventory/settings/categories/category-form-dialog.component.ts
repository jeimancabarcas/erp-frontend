import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { lastValueFrom } from 'rxjs';

import { Category } from '../../../../core/domain/entities/category.entity';
import { CreateCategoryUseCase } from '../../../../core/application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../../../core/application/use-cases/update-category.use-case';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-category-form-dialog',
    standalone: true,
    imports: [CommonModule, MaterialModule, TablerIconsModule, ReactiveFormsModule],
    template: `
        <h2 mat-dialog-title>
            {{ isEdit ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>

        <mat-dialog-content>
            <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
                <!-- Name -->
                <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Nombre</mat-label>
                    <input matInput formControlName="name" placeholder="Ej. Electrónica">
                    @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                        <mat-error>El nombre es obligatorio</mat-error>
                    }
                    @if (form.get('name')?.hasError('maxlength')) {
                        <mat-error>Máximo 100 caracteres</mat-error>
                    }
                    @if (form.get('name')?.hasError('duplicate')) {
                        <mat-error>Esta categoría ya existe</mat-error>
                    }
                </mat-form-field>

                <!-- Description -->
                <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Descripción (opcional)</mat-label>
                    <textarea matInput formControlName="description" rows="3"
                        placeholder="Descripción de la categoría"></textarea>
                </mat-form-field>
            </form>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="gap-2">
            <button mat-stroked-button (click)="cancel()">Cancelar</button>
            <button mat-flat-button color="primary" (click)="save()" [disabled]="isSaving">
                @if (isSaving) {
                    <mat-spinner diameter="18" class="inline-block"></mat-spinner>
                } @else {
                    {{ isEdit ? 'Guardar cambios' : 'Crear categoría' }}
                }
            </button>
        </mat-dialog-actions>
    `,
})
export class CategoryFormDialogComponent {
    protected isEdit: boolean;
    protected isSaving = false;

    private createCategory = inject(CreateCategoryUseCase);
    private updateCategory = inject(UpdateCategoryUseCase);
    private toast = inject(ToastService);
    private fb = inject(FormBuilder);

    constructor(
        public dialogRef: MatDialogRef<CategoryFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Category | null,
    ) {
        this.isEdit = !!data;
    }

    form = this.fb.group({
        name: [this.data?.name ?? '', [Validators.required, Validators.maxLength(100)]],
        description: [this.data?.description ?? ''],
    });

    cancel() { this.dialogRef.close(); }

    async save() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        try {
            if (this.isEdit) {
                await lastValueFrom(this.updateCategory.execute({
                    ...this.data,
                    ...this.form.value,
                } as Category));
                this.toast.success('Categoría actualizada');
            } else {
                await lastValueFrom(this.createCategory.execute(this.form.value as Partial<Category>));
                this.toast.success('Categoría creada');
            }
            this.dialogRef.close(true);
        } catch (err: any) {
            const errorCode = err?.error?.message?.errorCode ?? err?.error?.errorCode;
            if (err?.status === 409 && errorCode === 'CATEGORY_NAME_DUPLICATE') {
                this.form.get('name')?.setErrors({ duplicate: true });
                this.form.get('name')?.markAsTouched();
            } else {
                this.toast.error(err?.error?.message ?? 'Error al guardar la categoría');
            }
        } finally {
            this.isSaving = false;
        }
    }
}
