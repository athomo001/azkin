// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { MonitorType } from "../value-objects/monitor-type";

export interface IVisualMask {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Entidad pura que representa una configuración de monitoreo (Monitor) en el dominio de Azkin.
 * Sostiene las reglas de checks activos (HTTP, ping, TCP port, DNS), pasivos (Push)
 * y configuraciones de integridad visual/defacement.
 */
export interface IMonitor {
  id: string;
  userId: string; // ID del administrador propietario
  name: string;
  type: MonitorType;
  target: string; // URL (http) | host/IP (ping, port, dns) | opcional para tipo "push"
  port?: number; // Requerido solo cuando el tipo es "port"
  interval: number; // Segundos entre checks ordinarios (mínimo 20)
  retries: number; // Número de reintentos permitidos ante fallos antes de marcar DOWN
  retryInterval: number; // Segundos entre reintentos en estado PENDING (mínimo 20)
  group: string | null; // Monitor Group para jerarquía, permisos y dashboards
  tags: string[]; // Etiquetas libres para filtrados visuales en la UI
  isActive: boolean; // Indica si el agendamiento del check está activo
  notificationIds: string[]; // Canales de alerta INotification asociados a este monitor
  
  // Parámetros específicos adicionales
  pushToken?: string; // Token de autenticación único para heartbeats pasivos (push)
  keyword?: string; // Palabra clave que se debe validar en el cuerpo de la respuesta HTTP
  keywordMethod?: "presence" | "absence"; // Método de validación de palabra clave
  dnsResolver?: string; // Servidor DNS para resolución (ej. 8.8.8.8)
  dnsRecordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT"; // Tipo de registro DNS a solicitar
  
  // Parámetros específicos de SNMP
  snmpVersion?: "v1" | "v2c" | "v3";
  snmpCommunity?: string;
  snmpPort?: number;
  snmpOid?: string;
  snmpV3Username?: string;
  snmpV3AuthProtocol?: "md5" | "sha";
  snmpV3AuthKey?: string;
  snmpV3PrivProtocol?: "des" | "aes";
  snmpV3PrivKey?: string;
  
  // Soporte Cloudflare y peticiones de red
  headers?: Record<string, string>; // Cabeceras personalizadas de petición HTTP
  userAgent?: string; // User-Agent específico (evita bloqueos de firewall WAF)
  ignoreTls?: boolean; // Permite omitir la validación de certificados SSL/TLS
  // Declarado explícitamente por quien configura el monitor: el target vive en el mismo
  // servidor físico que Azkin. Los checkers HTTP/Puerto/Ping lo usan para reintentar vía
  // host.docker.internal ante cualquier fallo de conexión, no solo cuando el target es una
  // IP privada (cubre dominios/hostnames que resuelven al propio servidor). Ver
  // infrastructure/checkers/same-host-fallback.ts.
  sameHostAsAzkin?: boolean;
  
  // Detección de Defacement (Integridad Estructural/Visual)
  integrityEnabled?: boolean; // Habilita el módulo de análisis de integridad
  integrityProfile?: "static" | "dynamic"; // Perfil de análisis de la web
  integrityIgnoredCssSelectors?: string[]; // Selectores CSS a remover antes del análisis
  integrityVisualMasks?: IVisualMask[]; // Máscaras de coordenadas a pintar de negro en la captura
  integrityAllowedScripts?: string[]; // Lista blanca de urls de scripts autorizados
  integrityThreshold?: number; // Tolerancia de cambio visual de píxeles (ej: 0.10)

  createdAt: Date;
  updatedAt: Date;
}
