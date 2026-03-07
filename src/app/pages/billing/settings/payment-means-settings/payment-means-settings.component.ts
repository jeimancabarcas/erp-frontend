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

import { BillingPaymentMethod } from '../../../../core/domain/entities/billing-payment-method.entity';
import { GetBillingPaymentMethodsUseCase } from '../../../../core/application/use-cases/get-billing-payment-methods.use-case';
import { DeleteBillingPaymentMethodUseCase } from '../../../../core/application/use-cases/delete-billing-payment-method.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { BillingPaymentMethodFormComponent } from '../billing-payment-method-form/billing-payment-method-form.component';

@Component({
  selector: 'app-payment-means-settings',
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
  templateUrl: './payment-means-settings.component.html',
  styleUrl: './payment-means-settings.component.scss'
})
export class PaymentMeansSettingsComponent implements OnInit {
  private getBillingPaymentMethodsUseCase = inject(GetBillingPaymentMethodsUseCase);
  private deleteBillingPaymentMethodUseCase = inject(DeleteBillingPaymentMethodUseCase);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  public paymentMethods = signal<BillingPaymentMethod[]>([]);
  public isPaymentMethodsLoading = signal(false);

  ngOnInit() {
    this.loadPaymentMethods();
  }

  private loadPaymentMethods() {
    this.isPaymentMethodsLoading.set(true);
    this.getBillingPaymentMethodsUseCase.execute().subscribe({
      next: (data) => {
        this.paymentMethods.set(data);
        this.isPaymentMethodsLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar medios de pago');
        console.error(err);
        this.isPaymentMethodsLoading.set(false);
      }
    });
  }

  openPaymentMethodForm(paymentMethod?: BillingPaymentMethod) {
    const dialogRef = this.dialog.open(BillingPaymentMethodFormComponent, {
      width: '500px',
      data: paymentMethod,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaymentMethods();
      }
    });
  }

  async deletePaymentMethod(paymentMethod: BillingPaymentMethod) {
    if (confirm(`¿Estás seguro de eliminar el medio de pago "${paymentMethod.name}"?`)) {
      try {
        await lastValueFrom(this.deleteBillingPaymentMethodUseCase.execute(paymentMethod.id));
        this.toast.success('Medio de pago eliminado correctamente');
        this.loadPaymentMethods();
      } catch (err: any) {
        this.toast.error('Error al eliminar el medio de pago');
      }
    }
  }
}
