// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DnsToolRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';

export interface DnsLookupResult {
  ok: boolean;
  records: string[];
  ping: number | null;
  msg: string;
}

export interface DnsReverseLookupResult {
  ok: boolean;
  hostnames: string[];
  ping: number | null;
  msg: string;
}

/**
 * Herramienta de diagnóstico DNS puntual (no crea monitores): resolución directa y reversa
 * bajo demanda, disponible para cualquier rol logueado desde el navbar.
 */
@Injectable({ providedIn: 'root' })
export class DnsToolsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/tools';

  lookup(hostname: string, resolver?: string, recordType?: DnsToolRecordType): Observable<DnsLookupResult> {
    return this.http.post<DnsLookupResult>(`${this.apiUrl}/dns-lookup`, { hostname, resolver, recordType });
  }

  reverse(ip: string, resolver?: string): Observable<DnsReverseLookupResult> {
    return this.http.post<DnsReverseLookupResult>(`${this.apiUrl}/dns-reverse`, { ip, resolver });
  }
}
