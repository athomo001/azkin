// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IReportDefinition,
  IReportScope,
  ReportFrequency,
  ReportRecipientMode,
} from "../../../domain/entities/report-definition";

export interface CreateReportDefinitionData {
  createdBy: string;
  name: string;
  enabled: boolean;
  frequency: ReportFrequency;
  scope: IReportScope[];
  hour: number;
  dayOfWeek?: number;
  recipientMode: ReportRecipientMode;
  recipientEmails: string[];
}

export interface UpdateReportDefinitionData {
  name?: string;
  enabled?: boolean;
  frequency?: ReportFrequency;
  scope?: IReportScope[];
  hour?: number;
  dayOfWeek?: number;
  recipientMode?: ReportRecipientMode;
  recipientEmails?: string[];
}

/**
 * Puerto (interfaz) para el repositorio de definiciones de informes periódicos (AZ-045).
 * Sin aislamiento por tenant entre Admins (mismo criterio que Mantenimiento/notificaciones):
 * todas las definiciones son un único pool global, visibles y editables por cualquier Admin.
 */
export interface IReportDefinitionRepository {
  create(data: CreateReportDefinitionData): Promise<IReportDefinition>;
  findAll(): Promise<IReportDefinition[]>;
  findEnabled(): Promise<IReportDefinition[]>;
  findById(id: string): Promise<IReportDefinition | null>;
  update(id: string, data: UpdateReportDefinitionData): Promise<IReportDefinition | null>;
  delete(id: string): Promise<boolean>;
  /** Registra el envío programado más reciente, para evitar doble envío en el mismo periodo. */
  markSent(id: string, sentAt: Date): Promise<void>;
}
