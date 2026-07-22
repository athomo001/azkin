// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type ReportScopeType = 'all' | 'group' | 'monitor';
export type ReportFrequency = 'daily' | 'weekly';
export type ReportRecipientMode = 'default_alert_email' | 'custom_list';

export interface IReportScope {
  type: ReportScopeType;
  value?: string;
}

export interface IReportDefinition {
  id: string;
  name: string;
  enabled: boolean;
  frequency: ReportFrequency;
  scope: IReportScope[];
  hour: number;
  dayOfWeek: number | null;
  recipientMode: ReportRecipientMode;
  recipientEmails: string[];
  lastSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateReportDefinition {
  name: string;
  enabled: boolean;
  frequency: ReportFrequency;
  scope: IReportScope[];
  hour: number;
  dayOfWeek?: number;
  recipientMode: ReportRecipientMode;
  recipientEmails: string[];
}

export interface IUpdateReportDefinition {
  name?: string;
  enabled?: boolean;
  frequency?: ReportFrequency;
  scope?: IReportScope[];
  hour?: number;
  dayOfWeek?: number;
  recipientMode?: ReportRecipientMode;
  recipientEmails?: string[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/reports';

  readonly definitions = signal<IReportDefinition[]>([]);

  loadDefinitions(): Observable<IReportDefinition[]> {
    return this.http.get<IReportDefinition[]>(this.apiUrl).pipe(
      tap((data) => this.definitions.set(data)),
    );
  }

  create(data: ICreateReportDefinition): Observable<IReportDefinition> {
    return this.http.post<IReportDefinition>(this.apiUrl, data).pipe(
      tap((created) => this.definitions.update((list) => [created, ...list])),
    );
  }

  update(id: string, data: IUpdateReportDefinition): Observable<IReportDefinition> {
    return this.http.put<IReportDefinition>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updated) => this.definitions.update((list) => list.map((d) => (d.id === id ? updated : d)))),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.definitions.update((list) => list.filter((d) => d.id !== id))),
    );
  }

  sendTest(id: string): Observable<{ sent: boolean }> {
    return this.http.post<{ sent: boolean }>(`${this.apiUrl}/${id}/send-test`, {});
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
