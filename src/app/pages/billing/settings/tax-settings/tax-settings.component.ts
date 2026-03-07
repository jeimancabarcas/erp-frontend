import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { lastValueFrom } from 'rxjs';

import { BillingTax } from '../../../../core/domain/entities/billing-tax.entity';
import { GetBillingTaxesUseCase } from '../../../../core/application/use-cases/get-billing-taxes.use-case';
import { DeleteBillingTaxUseCase } from '../../../../core/application/use-cases/delete-billing-tax.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { BillingTaxFormComponent } from '../billing-tax-form/billing-tax-form.component';

@Component({
  selector: 'app-tax-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    TablerIconsModule,
    TableEmptyComponent,
    TableLoadingComponent
  ],
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.scss'
})
export class TaxSettingsComponent implements OnInit {
  private getBillingTaxesUseCase = inject(GetBillingTaxesUseCase);
  private deleteBillingTaxUseCase = inject(DeleteBillingTaxUseCase);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  public taxes = signal<BillingTax[]>([]);
  public isTaxesLoading = signal(false);

  ngOnInit() {
    this.loadTaxes();
  }

  private loadTaxes() {
    this.isTaxesLoading.set(true);
    this.getBillingTaxesUseCase.execute().subscribe({
      next: (data) => {
        this.taxes.set(data);
        this.isTaxesLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar configuración fiscal');
        console.error(err);
        this.isTaxesLoading.set(false);
      }
    });
  }

  openTaxForm(tax?: BillingTax) {
    const dialogRef = this.dialog.open(BillingTaxFormComponent, {
      width: '400px',
      data: tax,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTaxes();
      }
    });
  }

  async deleteTax(tax: BillingTax) {
    if (confirm(`¿Estás seguro de eliminar el impuesto "${tax.name}"?`)) {
      try {
        await lastValueFrom(this.deleteBillingTaxUseCase.execute(tax.id));
        this.toast.success('Impuesto eliminado correctamente');
        this.loadTaxes();
      } catch (err: any) {
        this.toast.error('Error al eliminar the impuesto');
      }
    }
  }
}
