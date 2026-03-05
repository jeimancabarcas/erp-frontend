import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { BillingClient } from '../../../../core/domain/entities/billing-client.entity';

@Component({
    selector: 'app-billing-client-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatDividerModule
    ],
    templateUrl: './billing-client-form.component.html',
})
export class BillingClientFormComponent implements OnInit {
    clientForm: FormGroup;
    isEditMode: boolean = false;
    documentTypes = ['CC', 'NIT', 'CE', 'Pasaporte'];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<BillingClientFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { client?: BillingClient }
    ) {
        this.clientForm = this.fb.group({
            documentType: ['CC', [Validators.required]],
            documentNumber: ['', [Validators.required]],
            name: ['', [Validators.required]],
            email: ['', [Validators.email]],
            phone: [''],
            address: [''],
            status: [true]
        });
    }

    ngOnInit() {
        if (this.data?.client) {
            this.isEditMode = true;
            this.clientForm.patchValue({
                documentType: this.data.client.documentType,
                documentNumber: this.data.client.documentNumber,
                name: this.data.client.name,
                email: this.data.client.email || '',
                phone: this.data.client.phone || '',
                address: this.data.client.address || '',
                status: this.data.client.status !== undefined ? this.data.client.status : true
            });
        }
    }

    onSubmit() {
        if (this.clientForm.valid) {
            this.dialogRef.close(this.clientForm.value);
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
