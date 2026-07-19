// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable } from '@angular/core';

/**
 * Centraliza la descarga de archivos generados en el cliente (AZ-020) — antes cada componente
 * repetía su propio `Blob`/`URL.createObjectURL`/`document.createElement('a')`.
 */
@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  downloadJson(data: unknown, filenamePrefix: string): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadBlob(json, 'application/json', `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.json`);
  }

  downloadText(content: string, mimeType: string, filename: string): void {
    this.downloadBlob(content, mimeType, filename);
  }

  private downloadBlob(content: string, mimeType: string, filename: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
