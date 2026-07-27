// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/** Campos de credenciales SNMP de un monitor que nunca deben viajar en texto plano fuera del
 * contexto de edición de un Admin (AZ-062) — mismo criterio que ya aplica
 * `notification-secrets.ts` a los secretos de canales de notificación. */
export const SENSITIVE_MONITOR_FIELDS = ["snmpCommunity", "snmpV3AuthKey", "snmpV3PrivKey"] as const;
