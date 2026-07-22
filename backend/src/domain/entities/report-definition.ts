// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type ReportFrequency = "daily" | "weekly";
export type ReportRecipientMode = "default_alert_email" | "custom_list";

export type ReportScopeType = "all" | "group" | "monitor";

export interface IReportScope {
  type: ReportScopeType;
  value?: string; // nombre de grupo o id de monitor; se omite si type === "all"
}
// Mismo shape que `IMaintenanceScope` (AZ-040) / permisos de Viewer — se reutiliza el mismo
// concepto de alcance granular en vez de inventar uno nuevo.

/**
 * Entidad pura que representa una definición de informe periódico de disponibilidad (AZ-045).
 * A diferencia de `IAppSmtpSettings`/`IMonitoringEngineSettings` (singleton por instancia), este
 * módulo admite múltiples definiciones independientes — una por área/alcance — siguiendo el mismo
 * patrón de colección con CRUD propio que `IMaintenanceWindow`.
 */
export interface IReportDefinition {
  id: string;
  name: string; // ej. "Diario — Comercial", visible en la UI y en el asunto del correo
  enabled: boolean;
  frequency: ReportFrequency;
  scope: IReportScope[];
  hour: number; // 0-23, hora local del servidor/instancia
  dayOfWeek?: number; // 0-6 (0 = domingo), solo si frequency === "weekly"
  recipientMode: ReportRecipientMode;
  recipientEmails: string[]; // solo aplica si recipientMode === "custom_list"
  // Evita doble envío si el tick del cron corre más de una vez dentro de la misma ventana
  // horaria/día (ver RunScheduledReportsUseCase).
  lastSentAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
