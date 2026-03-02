import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../core/domain/entities/product.entity';
import { CreateProductUseCase } from '../../core/application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../core/application/use-cases/update-product.use-case';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule,
    ],
    templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private createProductUseCase = inject(CreateProductUseCase);
    private updateProductUseCase = inject(UpdateProductUseCase);

    protected productForm: FormGroup;
    protected isEdit = false;

    constructor(
        public dialogRef: MatDialogRef<ProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Product
    ) {
        this.isEdit = !!data;
        this.productForm = this.fb.group({
            id: [data?.id || null],
            name: [data?.name || '', [Validators.required]],
            description: [data?.description || ''],
            price: [data?.price || 0, [Validators.required, Validators.min(0)]],
            stock: [data?.stock || 0, [Validators.required, Validators.min(0)]],
            category: [data?.category || '', [Validators.required]],
        });
    }

    ngOnInit(): void { }

    protected async onSubmit() {
        if (this.productForm.valid) {
            const productData = this.productForm.value;
            if (this.isEdit) {
                await lastValueFrom(this.updateProductUseCase.execute(productData));
            } else {
                await lastValueFrom(this.createProductUseCase.execute(productData));
            }
            this.dialogRef.close(true);
        }
    }

    protected onCancel() {
        this.dialogRef.close();
    }
}
