// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IReportData } from "../../dto/report-data.dto";

/**
 * Puerto (interfaz) para el generador de PDF de informes (AZ-045). Implementación de referencia:
 * `PdfmakeReportRenderer` (pdfmake, dibujo vectorial nativo — sin Puppeteer/Chromium ni el
 * paquete nativo `canvas`).
 */
export interface IReportPdfRenderer {
  render(data: IReportData): Promise<Buffer>;
}
