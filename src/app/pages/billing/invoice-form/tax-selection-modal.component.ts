import { Component, Inject, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingTax } from '../../../core/domain/entities/billing-tax.entity';
import { BillingTaxFormComponent } from '../settings/billing-tax-form/billing-tax-form.component';
import { GetBillingTaxesUseCase } from '../../../core/application/use-cases/get-billing-taxes.use-case';

@Component({
    selector: 'app-tax-selection-modal',
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
        <h2 class="text-2xl font-bold m-0 text-gray-800">Seleccionar Impuesto</h2>
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
        <mat-label>Buscar impuesto</mat-label>
        <input matInput [(ngModel)]="searchQuery" (input)="filterTaxes()" placeholder="Nombre del impuesto...">
        <i-tabler matPrefix name="search" class="size-5 me-2 text-gray-400"></i-tabler>
      </mat-form-field>

      <div class="max-h-[400px] overflow-auto border rounded-lg">
        <table mat-table [dataSource]="filteredTaxes()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let tax"> {{tax.name}} </td>
          </ng-container>

          <ng-container matColumnDef="rate">
            <th mat-header-cell *matHeaderCellDef> Tasa Máxima </th>
            <td mat-cell *matCellDef="let tax"> {{tax.rate}}% </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> </th>
            <td mat-cell *matCellDef="let tax" class="text-right">
              <button mat-stroked-button color="primary" (click)="selectTax(tax)">
                Seleccionar
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="hover:bg-gray-50 cursor-pointer" 
              (click)="selectTax(row)"></tr>
        </table>
      </div>
    </div>
  `
})
export class TaxSelectionModalComponent {
    private dialog = inject(MatDialog);
    private getTaxesUseCase = inject(GetBillingTaxesUseCase);

    searchQuery = '';
    displayedColumns: string[] = ['name', 'rate', 'actions'];
    filteredTaxes = signal<BillingTax[]>([]);

    constructor(
        public dialogRef: MatDialogRef<TaxSelectionModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { taxes: BillingTax[] }
    ) {
        this.filteredTaxes.set(this.data.taxes);
    }

    filterTaxes() {
        const query = this.searchQuery.toLowerCase();
        this.filteredTaxes.set(
            this.data.taxes.filter(t =>
                t.name.toLowerCase().includes(query)
            )
        );
    }

    onAddNew() {
        const dialogRef = this.dialog.open(BillingTaxFormComponent, {
            width: '500px',
            data: null
        });

        dialogRef.afterClosed().subscribe(newTax => {
            if (newTax) {
                // Refresh full list using use case to ensure we have the latest
                this.getTaxesUseCase.execute().subscribe(taxes => {
                    this.data.taxes = taxes;
                    this.filterTaxes();
                    // Automatically select the new one?
                    this.selectTax(newTax);
                });
            }
        });
    }

    selectTax(tax: BillingTax) {
        this.dialogRef.close(tax);
    }
}
