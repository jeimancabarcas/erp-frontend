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

import { BillingClient } from '../../../../core/domain/entities/billing-client.entity';
import { GetBillingClientsUseCase } from '../../../../core/application/use-cases/billing-client/get-billing-clients.use-case';
import { CreateBillingClientUseCase } from '../../../../core/application/use-cases/billing-client/create-billing-client.use-case';
import { UpdateBillingClientUseCase } from '../../../../core/application/use-cases/billing-client/update-billing-client.use-case';
import { DeleteBillingClientUseCase } from '../../../../core/application/use-cases/billing-client/delete-billing-client.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { BillingClientFormComponent } from '../billing-client-form/billing-client-form.component';

@Component({
  selector: 'app-client-settings',
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
  templateUrl: './client-settings.component.html',
  styleUrl: './client-settings.component.scss'
})
export class ClientSettingsComponent implements OnInit {
  private getBillingClientsUseCase = inject(GetBillingClientsUseCase);
  private createBillingClientUseCase = inject(CreateBillingClientUseCase);
  private updateBillingClientUseCase = inject(UpdateBillingClientUseCase);
  private deleteBillingClientUseCase = inject(DeleteBillingClientUseCase);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  public clients = signal<BillingClient[]>([]);
  public isClientsLoading = signal(false);
  public clientColumns = ['document', 'name', 'email', 'phone', 'status', 'actions'];

  ngOnInit() {
    this.loadClients();
  }

  private loadClients() {
    this.isClientsLoading.set(true);
    this.getBillingClientsUseCase.execute().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.isClientsLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar clientes');
        console.error(err);
        this.isClientsLoading.set(false);
      }
    });
  }

  openClientForm(client?: BillingClient) {
    const dialogRef = this.dialog.open(BillingClientFormComponent, {
      width: '600px',
      data: { client },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          if (client && client.id) {
            await lastValueFrom(this.updateBillingClientUseCase.execute(client.id, result));
            this.toast.success('Cliente actualizado correctamente');
          } else {
            await lastValueFrom(this.createBillingClientUseCase.execute(result));
            this.toast.success('Cliente creado correctamente');
          }
          this.loadClients();
        } catch (error) {
          this.toast.error('Error al guardar el cliente');
          console.error(error);
        }
      }
    });
  }

  async deleteClient(client: BillingClient) {
    if (confirm(`¿Estás seguro de eliminar el cliente "${client.name}"?`)) {
      try {
        await lastValueFrom(this.deleteBillingClientUseCase.execute(client.id));
        this.toast.success('Cliente eliminado correctamente');
        this.loadClients();
      } catch (err: any) {
        this.toast.error('Error al eliminar el cliente');
      }
    }
  }
}
