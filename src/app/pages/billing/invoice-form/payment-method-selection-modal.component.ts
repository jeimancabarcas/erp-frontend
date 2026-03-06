import { Component, Inject, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingPaymentMethod } from '../../../core/domain/entities/billing-payment-method.entity';
import { BillingPaymentMethodFormComponent } from '../settings/billing-payment-method-form/billing-payment-method-form.component';
import { GetBillingPaymentMethodsUseCase } from '../../../core/application/use-cases/get-billing-payment-methods.use-case';

@Component({
    selector: 'app-payment-method-selection-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatButtonModule,
        TablerIconsModule
    ],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold m-0 text-gray-800">Seleccionar Método de Pago</h2>
        <div class="flex items-center gap-2">
            <button mat-flat-button color="primary" (click)="onAddNew()">
                <div class="flex items-center gap-2">
                    <i-tabler name="plus" class="size-4"></i-tabler> Nuevo
                </div>
            </button>
            <button mat-icon-button (click)="dialogRef.close()">
                <i-tabler name="x" class="size-5"></i-tabler>
            </button>
        </div>
      </div>

      <mat-form-field appearance="outline" class="w-full mb-4">
        <mat-label>Buscar método de pago</mat-label>
        <input matInput [(ngModel)]="searchQuery" (input)="filterMethods()" placeholder="Nombre del método...">
        <i-tabler matPrefix name="search" class="size-5 me-2 text-gray-400"></i-tabler>
      </mat-form-field>

      <div class="max-h-[400px] overflow-auto border rounded-lg">
        <table mat-table [dataSource]="filteredMethods()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let method"> {{method.name}} </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef> Detalles </th>
            <td mat-cell *matCellDef="let method"> 
                <span class="text-xs text-gray-500 truncate max-w-[200px] block">
                    {{method.details || '-'}}
                </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> </th>
            <td mat-cell *matCellDef="let method" class="text-right">
              <button mat-stroked-button color="primary" (click)="selectMethod(method)">
                Seleccionar
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="hover:bg-gray-50 cursor-pointer" 
              (click)="selectMethod(row)"></tr>
        </table>
      </div>
    </div>
  `
})
export class PaymentMethodSelectionModalComponent {
    private dialog = inject(MatDialog);
    private getMethodsUseCase = inject(GetBillingPaymentMethodsUseCase);

    searchQuery = '';
    displayedColumns: string[] = ['name', 'details', 'actions'];
    filteredMethods = signal<BillingPaymentMethod[]>([]);

    constructor(
        public dialogRef: MatDialogRef<PaymentMethodSelectionModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { methods: BillingPaymentMethod[] }
    ) {
        this.filteredMethods.set(this.data.methods);
    }

    filterMethods() {
        const query = this.searchQuery.toLowerCase();
        this.filteredMethods.set(
            this.data.methods.filter(m =>
                m.name.toLowerCase().includes(query) ||
                (m.details?.toLowerCase().includes(query))
            )
        );
    }

    onAddNew() {
        const dialogRef = this.dialog.open(BillingPaymentMethodFormComponent, {
            width: '500px',
            data: null
        });

        dialogRef.afterClosed().subscribe(newPm => {
            if (newPm) {
                this.getMethodsUseCase.execute().subscribe(methods => {
                    this.data.methods = methods;
                    this.filterMethods();
                    // Automatically select the new one
                    this.selectMethod(newPm);
                });
            }
        });
    }

    selectMethod(method: BillingPaymentMethod) {
        this.dialogRef.close(method);
    }
}
