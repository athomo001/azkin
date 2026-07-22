// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IReportDefinition } from "../../../domain/entities/report-definition";

export function toReportDefinitionResponse(definition: IReportDefinition) {
  return {
    id: definition.id,
    name: definition.name,
    enabled: definition.enabled,
    frequency: definition.frequency,
    scope: definition.scope,
    hour: definition.hour,
    dayOfWeek: definition.dayOfWeek ?? null,
    recipientMode: definition.recipientMode,
    recipientEmails: definition.recipientEmails,
    lastSentAt: definition.lastSentAt ? definition.lastSentAt.toISOString() : null,
    createdAt: definition.createdAt.toISOString(),
    updatedAt: definition.updatedAt.toISOString(),
  };
}
