import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Movement } from '../../domain/entities/movement.entity';
import { MovementRepository } from '../../domain/repositories/movement.repository';

@Injectable({
    providedIn: 'root'
})
export class CreateMovementUseCase {
    private repository = inject(MovementRepository);

    execute(movement: Partial<Movement>): Observable<Movement> {
        return this.repository.createMovement(movement);
    }
}
