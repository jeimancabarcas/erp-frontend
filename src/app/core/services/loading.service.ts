import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private _count = signal(0);

    /** True when at least one HTTP request is in flight */
    readonly loading = this._count.asReadonly();

    increment(): void {
        this._count.update((n) => n + 1);
    }

    decrement(): void {
        this._count.update((n) => Math.max(0, n - 1));
    }

    isLoading(): boolean {
        return this._count() > 0;
    }
}
