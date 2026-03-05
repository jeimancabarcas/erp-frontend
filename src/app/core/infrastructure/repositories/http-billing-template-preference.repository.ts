import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BillingTemplatePreference } from '../../domain/entities/billing-template-preference.entity';
import { BillingTemplatePreferenceRepository } from '../../domain/repositories/billing-template-preference.repository';

@Injectable({
    providedIn: 'root'
})
export class HttpBillingTemplatePreferenceRepository extends BillingTemplatePreferenceRepository {
    private readonly apiUrl = `${environment.apiUrl}/billing/preferences`;
    private http = inject(HttpClient);

    getPreference(): Observable<BillingTemplatePreference> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    updatePreference(preference: Partial<BillingTemplatePreference>): Observable<BillingTemplatePreference> {
        return this.http.put<any>(this.apiUrl, preference).pipe(
            map(response => response.data)
        );
    }
}
