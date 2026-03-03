import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovementRepository } from '../../core/domain/repositories/movement.repository';
import { Movement } from '../../core/domain/entities/movement.entity';
import { ApiResponse } from '../../core/interfaces/api-response.interface';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MovementHttpRepository extends MovementRepository {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/inventory/movements`;

    getMovements(): Observable<Movement[]> {
        return this.http.get<ApiResponse<Movement[]>>(this.apiUrl).pipe(map(res => res.data));
    }

    createMovement(movement: Partial<Movement>): Observable<Movement> {
        return this.http.post<ApiResponse<Movement>>(this.apiUrl, movement).pipe(map(res => res.data));
    }
}
