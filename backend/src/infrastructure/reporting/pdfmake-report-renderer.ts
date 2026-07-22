// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import pdfMake from "pdfmake";
import { IReportPdfRenderer } from "../../application/ports/services/report-pdf-renderer";
import { IReportData, ReportMonitorRow } from "../../application/dto/report-data.dto";
import {
  formatDateRange,
  formatDurationSeconds,
  formatSignedDurationSeconds,
  formatSignedInteger,
  formatSignedPercentPoints,
  formatUptimePercent,
} from "../../application/services/report-format";

// PDFKit trae 14 fuentes estándar embebidas (Helvetica/Times/Courier) que no requieren archivos
// .ttf externos — evita depender de assets de fuentes para poder generar el PDF en cualquier SO.
pdfMake.setFonts({
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
});
// El documento no referencia imágenes ni URLs externas — deniega explícitamente el acceso a URL
// para no dejar la política sin definir. `setLocalAccessPolicy` se deja sin definir a propósito:
// pdfmake resuelve las fuentes estándar de PDFKit (Helvetica, etc.) por el mismo mecanismo de
// "archivo local" (ver `PDFDocument.provideFont`/`validateLocalFile`), así que denegarlo rompería
// la carga de fuentes; no hay ningún archivo del sistema real involucrado en este documento.
pdfMake.setUrlAccessPolicy(() => false);

const COLOR_GOOD = "#16a34a";
const COLOR_BAD = "#dc2626";
const COLOR_NEUTRAL = "#6b7280";
const COLOR_BAR = "#ea580c";
const COLOR_HEADER_FILL = "#f3f4f6";

function kpiCard(label: string, valueText: string, deltaText: string, deltaIsGood: boolean | null) {
  return {
    stack: [
      { text: label, fontSize: 8, color: COLOR_NEUTRAL, bold: true },
      { text: valueText, fontSize: 18, bold: true, margin: [0, 2, 0, 2] },
      { text: deltaText, fontSize: 8, color: deltaIsGood === null ? COLOR_NEUTRAL : deltaIsGood ? COLOR_GOOD : COLOR_BAD },
    ],
    margin: [0, 0, 0, 0],
  };
}

function buildKpiRow(data: IReportData) {
  const { uptimeRatio, totalIncidents, totalDowntimeSeconds } = data.kpis;

  return {
    columns: [
      kpiCard(
        "Uptime del periodo",
        formatUptimePercent(uptimeRatio.current),
        `${formatSignedPercentPoints(uptimeRatio.delta)} vs. periodo anterior`,
        uptimeRatio.delta >= 0,
      ),
      kpiCard(
        "Incidentes totales",
        String(totalIncidents.current),
        `${formatSignedInteger(totalIncidents.delta)} vs. periodo anterior`,
        totalIncidents.delta <= 0,
      ),
      kpiCard(
        "Downtime acumulado",
        formatDurationSeconds(totalDowntimeSeconds.current),
        `${formatSignedDurationSeconds(totalDowntimeSeconds.delta)} vs. periodo anterior`,
        totalDowntimeSeconds.delta <= 0,
      ),
      kpiCard(
        "Monitor más estable",
        data.bestMonitor?.monitorName ?? "N/D",
        data.bestMonitor ? formatUptimePercent(data.bestMonitor.uptimeRatio) : "",
        null,
      ),
    ],
    columnGap: 16,
    margin: [0, 0, 0, 8],
  };
}

function buildTopOffendersTable(data: IReportData) {
  if (data.topOffenders.length === 0) {
    return { text: "Sin incidentes registrados en este periodo.", italics: true, color: COLOR_NEUTRAL, margin: [0, 0, 0, 8] };
  }

  const header = [
    { text: "Monitor", style: "tableHeader" },
    { text: "Grupo", style: "tableHeader" },
    { text: "Incidentes", style: "tableHeader" },
    { text: "Downtime", style: "tableHeader" },
    { text: "Uptime", style: "tableHeader" },
  ];
  const rows = data.topOffenders.map((row) => [
    row.monitorName,
    row.group ?? "—",
    String(row.incidents),
    formatDurationSeconds(row.downtimeSeconds),
    formatUptimePercent(row.uptimeRatio),
  ]);

  const table: Record<string, unknown> = {
    table: { headerRows: 1, dontBreakRows: true, widths: ["*", "*", "auto", "auto", "auto"], body: [header, ...rows] },
    layout: "lightHorizontalLines",
    margin: [0, 0, 0, 4],
  };

  const content: Record<string, unknown>[] = [table];
  if (data.otherOffendersCount > 0) {
    content.push({
      text: `+ ${data.otherOffendersCount} monitor(es) adicional(es) con incidentes, ${formatDurationSeconds(data.otherOffendersDowntimeSeconds)} de downtime combinado.`,
      fontSize: 8,
      italics: true,
      color: COLOR_NEUTRAL,
      margin: [0, 0, 0, 8],
    });
  }
  return { stack: content };
}

function buildZeroIncidentSection(rows: ReportMonitorRow[]) {
  if (rows.length === 0) {
    return { text: "Ningún monitor del alcance quedó sin incidentes en este periodo.", italics: true, color: COLOR_NEUTRAL, margin: [0, 0, 0, 8] };
  }
  return {
    columns: [
      {
        width: "*",
        ul: rows.map((row) => `${row.monitorName}${row.group ? ` (${row.group})` : ""}`),
        fontSize: 9,
      },
    ],
    margin: [0, 0, 0, 8],
  };
}

function buildDowntimeChart(rows: ReportMonitorRow[]) {
  if (rows.length === 0) {
    return { text: "", margin: [0, 0, 0, 0] };
  }
  const maxDowntime = Math.max(...rows.map((r) => r.downtimeSeconds), 1);
  const maxBarWidth = 320;

  return {
    stack: rows.map((row) => {
      const barWidth = Math.max(2, Math.round((row.downtimeSeconds / maxDowntime) * maxBarWidth));
      return {
        columns: [
          { text: row.monitorName, width: 130, fontSize: 8 },
          {
            width: maxBarWidth + 10,
            canvas: [{ type: "rect", x: 0, y: 2, w: barWidth, h: 10, color: COLOR_BAR }],
          },
          { text: formatDurationSeconds(row.downtimeSeconds), width: "auto", fontSize: 8, color: COLOR_NEUTRAL },
        ],
        columnGap: 6,
        margin: [0, 0, 0, 4],
      };
    }),
    margin: [0, 0, 0, 8],
  };
}

function buildDetailTable(rows: ReportMonitorRow[]) {
  const header = [
    { text: "Monitor", style: "tableHeader" },
    { text: "Grupo", style: "tableHeader" },
    { text: "Incidentes", style: "tableHeader" },
    { text: "Downtime", style: "tableHeader" },
    { text: "Uptime", style: "tableHeader" },
  ];
  const body = rows.map((row) => [
    row.monitorName,
    row.group ?? "—",
    String(row.incidents),
    formatDurationSeconds(row.downtimeSeconds),
    formatUptimePercent(row.uptimeRatio),
  ]);
  return {
    table: { headerRows: 1, dontBreakRows: true, widths: ["*", "*", "auto", "auto", "auto"], body: [header, ...body] },
    layout: "lightHorizontalLines",
  };
}

/**
 * Genera el PDF ejecutivo de un informe de disponibilidad (AZ-045) con `pdfmake`, sin
 * Puppeteer/Chromium ni el paquete nativo `canvas`: los gráficos se dibujan con las primitivas
 * vectoriales propias de pdfmake (rectángulos), y el texto usa las fuentes estándar de PDFKit
 * (Helvetica), sin archivos de fuente externos.
 */
export class PdfmakeReportRenderer implements IReportPdfRenderer {
  async render(data: IReportData): Promise<Buffer> {
    const docDefinition = {
      pageSize: "LETTER",
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      defaultStyle: { font: "Helvetica", fontSize: 9 },
      styles: {
        title: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] as [number, number, number, number] },
        subtitle: { fontSize: 9, color: COLOR_NEUTRAL, margin: [0, 0, 0, 16] as [number, number, number, number] },
        sectionTitle: { fontSize: 12, bold: true, margin: [0, 16, 0, 8] as [number, number, number, number] },
        tableHeader: { bold: true, fontSize: 8, fillColor: COLOR_HEADER_FILL },
      },
      footer: (currentPage: number, pageCount: number) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: "center",
        fontSize: 8,
        color: COLOR_NEUTRAL,
        margin: [0, 10, 0, 0] as [number, number, number, number],
      }),
      content: [
        { text: data.definitionName, style: "title" },
        { text: formatDateRange(data.from, data.to), style: "subtitle" },
        { text: "Resumen ejecutivo", style: "sectionTitle" },
        buildKpiRow(data),
        { text: "Top de indisponibilidad / degradación", style: "sectionTitle" },
        buildTopOffendersTable(data),
        { text: "Servicios sin incidentes", style: "sectionTitle" },
        buildZeroIncidentSection(data.zeroIncidentMonitors),
        { text: "Histograma de caídas (por downtime)", style: "sectionTitle" },
        buildDowntimeChart(data.topOffenders),
        { text: "Detalle completo", style: "sectionTitle" },
        buildDetailTable(data.monitorRows),
      ],
    };

    const doc = pdfMake.createPdf(docDefinition);
    return doc.getBuffer();
  }
}
