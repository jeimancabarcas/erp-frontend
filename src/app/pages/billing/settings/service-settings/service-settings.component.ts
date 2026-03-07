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

import { BillingService } from '../../../../core/domain/entities/billing-service.entity';
import { GetBillingServicesUseCase } from '../../../../core/application/use-cases/get-billing-services.use-case';
import { DeleteBillingServiceUseCase } from '../../../../core/application/use-cases/delete-billing-service.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { BillingServiceFormComponent } from '../billing-service-form/billing-service-form.component';

@Component({
  selector: 'app-service-settings',
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
  templateUrl: './service-settings.component.html',
  styleUrl: './service-settings.component.scss'
})
export class ServiceSettingsComponent implements OnInit {
  private getBillingServicesUseCase = inject(GetBillingServicesUseCase);
  private deleteBillingServiceUseCase = inject(DeleteBillingServiceUseCase);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  public services = signal<BillingService[]>([]);
  public isServicesLoading = signal(false);
  public serviceColumns = ['name', 'codes', 'tax', 'price', 'actions'];

  ngOnInit() {
    this.loadServices();
  }

  private loadServices() {
    this.isServicesLoading.set(true);
    this.getBillingServicesUseCase.execute().subscribe({
      next: (data) => {
        this.services.set(data);
        this.isServicesLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar servicios de facturación');
        console.error(err);
        this.isServicesLoading.set(false);
      }
    });
  }

  openServiceForm(service?: BillingService) {
    const dialogRef = this.dialog.open(BillingServiceFormComponent, {
      width: '500px',
      data: service,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadServices();
      }
    });
  }

  async deleteService(service: BillingService) {
    if (confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
      try {
        await lastValueFrom(this.deleteBillingServiceUseCase.execute(service.id));
        this.toast.success('Servicio eliminado correctamente');
        this.loadServices();
      } catch (err: any) {
        this.toast.error('Error al eliminar el servicio');
      }
    }
  }
}
