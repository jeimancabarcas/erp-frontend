import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingClient } from '../../../core/domain/entities/billing-client.entity';

@Component({
    selector: 'app-client-selection-modal',
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
        <h2 class="text-2xl font-bold m-0 text-gray-800">Seleccionar Cliente</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <i-tabler name="x" class="size-5"></i-tabler>
        </button>
      </div>

      <mat-form-field appearance="outline" class="w-full mb-4">
        <mat-label>Buscar cliente</mat-label>
        <input matInput [(ngModel)]="searchQuery" (input)="filterClients()" placeholder="Nombre o documento...">
        <i-tabler matPrefix name="search" class="size-5 me-2 text-gray-400"></i-tabler>
      </mat-form-field>

      <div class="max-h-[400px] overflow-auto border rounded-lg">
        <table mat-table [dataSource]="filteredClients()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let client"> {{client.name}} </td>
          </ng-container>

          <ng-container matColumnDef="document">
            <th mat-header-cell *matHeaderCellDef> Documento </th>
            <td mat-cell *matCellDef="let client"> {{client.documentNumber}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> </th>
            <td mat-cell *matCellDef="let client" class="text-right">
              <button mat-stroked-button color="primary" (click)="selectClient(client)">
                Seleccionar
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="hover:bg-gray-50 cursor-pointer" 
              (click)="selectClient(row)"></tr>
        </table>
      </div>
    </div>
  `
})
export class ClientSelectionModalComponent {
    searchQuery = '';
    displayedColumns: string[] = ['name', 'document', 'actions'];
    filteredClients = signal<BillingClient[]>([]);

    constructor(
        public dialogRef: MatDialogRef<ClientSelectionModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { clients: BillingClient[] }
    ) {
        this.filteredClients.set(this.data.clients);
    }

    filterClients() {
        const query = this.searchQuery.toLowerCase();
        this.filteredClients.set(
            this.data.clients.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.documentNumber.toLowerCase().includes(query)
            )
        );
    }

    selectClient(client: BillingClient) {
        this.dialogRef.close(client);
    }
}
