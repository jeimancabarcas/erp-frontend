import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-item-selection-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    TablerIconsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold m-0 text-gray-800">Seleccionar Producto o Servicio</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <i-tabler name="x" class="size-5"></i-tabler>
        </button>
      </div>

      <mat-form-field appearance="outline" class="w-full mb-4">
        <mat-label>Buscar producto o servicio</mat-label>
        <input matInput [(ngModel)]="searchQuery" (input)="filterItems()" placeholder="Nombre o código...">
        <i-tabler matPrefix name="search" class="size-5 me-2 text-gray-400"></i-tabler>
      </mat-form-field>

      <div class="max-h-[400px] overflow-auto border rounded-lg">
        <table mat-table [dataSource]="filteredItems()" class="w-full">
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef> Tipo </th>
            <td mat-cell *matCellDef="let item"> 
              <span class="px-2 py-1 rounded-full text-[10px] uppercase font-bold"
                    [ngClass]="item.type === 'Producto' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                {{item.type}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let item"> {{item.name}} </td>
          </ng-container>
          
          <ng-container matColumnDef="tax">
            <th mat-header-cell *matHeaderCellDef> Impuestos </th>
            <td mat-cell *matCellDef="let item"> 
                @for (t of item.taxes; track $index) {
                    <span class="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded me-1">
                        {{ t.tax?.name || 'Imp.' }}: {{ t.rate }}%
                    </span>
                } @empty {
                    <span class="text-xs text-gray-300">-</span>
                }
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Precio </th>
            <td mat-cell *matCellDef="let item"> {{item.price | currency}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> </th>
            <td mat-cell *matCellDef="let item" class="text-right">
              <button mat-stroked-button color="primary" (click)="selectItem(item)">
                Seleccionar
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="hover:bg-gray-50 cursor-pointer" 
              (click)="selectItem(row)"></tr>
        </table>
      </div>
    </div>
  `
})
export class ItemSelectionModalComponent {
  searchQuery = '';
  displayedColumns: string[] = ['type', 'name', 'tax', 'price', 'actions'];
  filteredItems = signal<any[]>([]);

  constructor(
    public dialogRef: MatDialogRef<ItemSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: any[] }
  ) {
    this.filteredItems.set(this.data.items);
  }

  filterItems() {
    const query = this.searchQuery.toLowerCase();
    this.filteredItems.set(
      this.data.items.filter(i =>
        i.name.toLowerCase().includes(query) ||
        (i.standardCode?.toLowerCase().includes(query)) ||
        (i.internalCode?.toLowerCase().includes(query))
      )
    );
  }

  selectItem(item: any) {
    this.dialogRef.close(item);
  }
}
