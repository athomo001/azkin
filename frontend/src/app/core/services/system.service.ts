// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface IHealthStatus {
  status: string;
  version: string;
  uptimeSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly http = inject(HttpClient);

  readonly version = signal<string | null>(null);

  loadHealth() {
    return this.http.get<IHealthStatus>('/health').pipe(
      tap((health) => this.version.set(health.version))
    );
  }
}
