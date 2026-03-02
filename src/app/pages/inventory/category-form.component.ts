import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        TranslateModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ 'Add New Category' | translate }}</h2>
        <mat-dialog-content>
            <form [formGroup]="categoryForm" class="flex flex-col gap-4 mt-4">
                <mat-form-field appearance="outline">
                    <input matInput formControlName="name" placeholder="{{ 'Enter category name' | translate }}">
                    @if (categoryForm.get('name')?.hasError('required')) {
                        <mat-error>
                            {{ 'Category name is required' | translate }}
                        </mat-error>
                    }
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end" class="p-24 pt-0">
            <button mat-button (click)="onCancel()">{{ 'Cancel' | translate }}</button>
            <button mat-flat-button color="primary" [disabled]="categoryForm.invalid" (click)="onSubmit()">
                {{ 'Save' | translate }}
            </button>
        </mat-dialog-actions>
    `,
})
export class CategoryFormComponent {
    private fb = inject(FormBuilder);
    protected dialogRef = inject(MatDialogRef<CategoryFormComponent>);

    protected categoryForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
    });

    protected onSubmit() {
        if (this.categoryForm.valid) {
            this.dialogRef.close(this.categoryForm.value.name);
        }
    }

    protected onCancel() {
        this.dialogRef.close();
    }
}
