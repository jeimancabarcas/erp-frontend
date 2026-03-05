import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingService } from '../../domain/entities/billing-service.entity';
import { BillingServiceRepository } from '../../domain/repositories/billing-service.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingServiceRepository implements BillingServiceRepository {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/billing-services`;

    getServices(): Observable<BillingService[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    createService(service: Omit<BillingService, 'id' | 'createdAt' | 'updatedAt'>): Observable<BillingService> {
        return this.http.post<any>(this.apiUrl, service).pipe(
            map(response => response.data)
        );
    }

    updateService(id: string, service: Partial<BillingService>): Observable<BillingService> {
        return this.http.patch<any>(`${this.apiUrl}/${id}`, service).pipe(
            map(response => response.data)
        );
    }

    deleteService(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}
