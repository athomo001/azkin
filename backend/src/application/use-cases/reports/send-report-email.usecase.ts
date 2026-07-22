// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { GenerateReportDataUseCase } from "./generate-report-data.usecase";
import { IReportPdfRenderer } from "../../ports/services/report-pdf-renderer";
import { IMailer } from "../../ports/services/mailer";
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { ResolveDefaultAlertRecipients } from "../../services/resolve-default-alert-recipients";
import { IReportData } from "../../dto/report-data.dto";
import { IReportDefinition } from "../../../domain/entities/report-definition";
import { ValidationError } from "../../../domain/errors/domain-error";
import {
  formatDateRange,
  formatDurationSeconds,
  formatSignedDurationSeconds,
  formatSignedInteger,
  formatSignedPercentPoints,
  formatUptimePercent,
} from "../../services/report-format";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos tras la normalización NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildSummaryText(data: IReportData): string {
  const { uptimeRatio, totalIncidents, totalDowntimeSeconds } = data.kpis;
  return [
    `Informe: ${data.definitionName}`,
    `Periodo: ${formatDateRange(data.from, data.to)}`,
    ``,
    `Uptime del periodo: ${formatUptimePercent(uptimeRatio.current)} (${formatSignedPercentPoints(uptimeRatio.delta)} vs. periodo anterior)`,
    `Incidentes totales: ${totalIncidents.current} (${formatSignedInteger(totalIncidents.delta)} vs. periodo anterior)`,
    `Downtime acumulado: ${formatDurationSeconds(totalDowntimeSeconds.current)} (${formatSignedDurationSeconds(totalDowntimeSeconds.delta)} vs. periodo anterior)`,
    ``,
    `Se adjunta el informe completo en PDF.`,
  ].join("\n");
}

function buildSummaryHtml(data: IReportData): string {
  const { uptimeRatio, totalIncidents, totalDowntimeSeconds } = data.kpis;
  const topRows = data.topOffenders
    .slice(0, 5)
    .map(
      (row) =>
        `<tr><td>${row.monitorName}</td><td>${row.incidents}</td><td>${formatDurationSeconds(row.downtimeSeconds)}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2 style="margin-bottom: 4px;">${data.definitionName}</h2>
      <p style="color:#6b7280; margin-top: 0;">${formatDateRange(data.from, data.to)}</p>
      <table cellpadding="6" style="border-collapse: collapse; margin: 12px 0;">
        <tr>
          <td><b>Uptime</b><br>${formatUptimePercent(uptimeRatio.current)}<br><small>${formatSignedPercentPoints(uptimeRatio.delta)}</small></td>
          <td><b>Incidentes</b><br>${totalIncidents.current}<br><small>${formatSignedInteger(totalIncidents.delta)}</small></td>
          <td><b>Downtime</b><br>${formatDurationSeconds(totalDowntimeSeconds.current)}<br><small>${formatSignedDurationSeconds(totalDowntimeSeconds.delta)}</small></td>
        </tr>
      </table>
      ${
        topRows
          ? `<h3>Top de indisponibilidad</h3><table cellpadding="6" style="border-collapse: collapse;"><tr><th align="left">Monitor</th><th align="left">Incidentes</th><th align="left">Downtime</th></tr>${topRows}</table>`
          : "<p>Sin incidentes registrados en este periodo.</p>"
      }
      <p>El informe completo, con gráficos y detalle por monitor, va adjunto en PDF.</p>
    </div>
  `;
}

export interface SendReportEmailOptions {
  isTest?: boolean;
  now?: Date;
}

/**
 * Genera el `IReportData`, renderiza el PDF, resuelve destinatarios según `recipientMode`, y
 * envía el correo con el PDF adjunto (AZ-045). Reutilizada tanto por el tick del cron
 * (`RunScheduledReportsUseCase`) como por "Enviar prueba" (`SendTestReportUseCase`).
 */
export class SendReportEmailUseCase {
  constructor(
    private readonly generateReportData: GenerateReportDataUseCase,
    private readonly pdfRenderer: IReportPdfRenderer,
    private readonly mailer: IMailer,
    private readonly defaultRecipients: ResolveDefaultAlertRecipients,
    private readonly reports: IReportDefinitionRepository,
  ) {}

  async execute(definition: IReportDefinition, options: SendReportEmailOptions = {}): Promise<void> {
    const now = options.now ?? new Date();

    const data = await this.generateReportData.execute({
      definitionName: definition.name,
      frequency: definition.frequency,
      scope: definition.scope,
      to: now,
    });

    const recipients =
      definition.recipientMode === "custom_list" ? definition.recipientEmails : await this.defaultRecipients.resolve();

    if (recipients.length === 0) {
      throw new ValidationError(
        definition.recipientMode === "custom_list"
          ? "El informe no tiene destinatarios configurados en su lista personalizada."
          : 'No hay un "correo de alertas global" configurado (Settings → TLS/Sistema → SMTP de Aplicación) para usar como destinatario por defecto.',
      );
    }

    const pdfBuffer = await this.pdfRenderer.render(data);
    const subjectPrefix = options.isTest ? "[PRUEBA] " : "";

    await this.mailer.send(
      {
        to: recipients.join(", "),
        subject: `${subjectPrefix}${definition.name} — ${formatDateRange(data.from, data.to)}`,
        text: buildSummaryText(data),
        html: buildSummaryHtml(data),
        attachments: [{ filename: `${slugify(definition.name)}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
      },
      { throwOnFailure: true },
    );

    if (!options.isTest) {
      await this.reports.markSent(definition.id, now);
    }
  }
}
