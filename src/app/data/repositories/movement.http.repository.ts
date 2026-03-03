import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovementRepository, MovementsQuery, MovementsListResponse, MovementMonthlyStats } from '../../core/domain/repositories/movement.repository';
import { Movement } from '../../core/domain/entities/movement.entity';
import { ApiResponse } from '../../core/interfaces/api-response.interface';
import { map } from 'rxjs';

import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MovementHttpRepository extends MovementRepository {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/inventory/movements`;

    getMovements(query?: MovementsQuery): Observable<MovementsListResponse> {
        let params = new HttpParams();
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params = params.set(key, value.toString());
                }
            });
        }

        return this.http.get<ApiResponse<MovementsListResponse>>(this.apiUrl, { params }).pipe(
            map(response => response.data)
        );
    }

    getMonthlyStats(): Observable<MovementMonthlyStats> {
        return this.http.get<ApiResponse<MovementMonthlyStats>>(`${this.apiUrl}/stats`).pipe(
            map(response => response.data)
        );
    }

    createMovement(movement: Partial<Movement>): Observable<Movement> {
        return this.http.post<ApiResponse<Movement>>(this.apiUrl, movement).pipe(map(res => res.data));
    }
}
