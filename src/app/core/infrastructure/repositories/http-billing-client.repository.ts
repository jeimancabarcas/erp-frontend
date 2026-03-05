import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingClient } from '../../domain/entities/billing-client.entity';
import { BillingClientRepository } from '../../domain/repositories/billing-client.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingClientRepository implements BillingClientRepository {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/billing-clients`;

    findAll(): Observable<BillingClient[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data || response)
        );
    }

    create(client: Partial<BillingClient>): Observable<BillingClient> {
        return this.http.post<any>(this.apiUrl, client).pipe(
            map(response => response.data || response)
        );
    }

    update(id: string, updates: Partial<BillingClient>): Observable<BillingClient> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, updates).pipe(
            map(response => response.data || response)
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data || response)
        );
    }
}
