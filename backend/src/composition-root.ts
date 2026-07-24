// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import http from "http";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import pLimit from "p-limit";
import cron from "node-cron";
import { Server } from "socket.io";
import { logger } from "./infrastructure/logger";
import { getErrorMessage } from "./application/services/get-error-message";

import { Env } from "./infrastructure/config/env";
import { IScheduler } from "./application/ports/services/scheduler";
import { ITlsServerManager } from "./application/ports/services/tls-server-manager";
import { ITlsConfigRepository } from "./application/ports/repositories/tls-config-repository";

// Repositories
import { MongooseUserRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-user.repository";
import { MongooseMonitorRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-monitor.repository";
import { MongooseHeartbeatRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository";
import { MongooseNotificationRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-notification.repository";
import { MongooseBackupRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-backup.repository";
import { MongooseAuditLogRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-audit-log.repository";
import { MongooseTlsConfigRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-tls-config.repository";
import { MongooseApiKeyRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-api-key.repository";
import { MongooseAppSmtpSettingsRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-app-smtp-settings.repository";
import { MongooseMaintenanceRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-maintenance.repository";
import { MongooseMonitoringEngineSettingsRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-monitoring-engine-settings.repository";
import { MongooseReportDefinitionRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-report-definition.repository";
import { MongooseFederatedInstanceRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-federated-instance.repository";
import { MongooseFederationEnrollmentTokenRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-federation-enrollment-token.repository";
import { MongooseFederatedMonitorLinkRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-federated-monitor-link.repository";
import { MongooseFederatedHeartbeatRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-federated-heartbeat.repository";
import { MongooseFederationSettingsRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-federation-settings.repository";

// Services
import { JwtTokenService } from "./infrastructure/security/jwt-token-service";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";
import { SocketIoGateway } from "./infrastructure/realtime/socketio.gateway";
import { MultichannelNotifier } from "./infrastructure/notifier/multichannel-notifier";
import { CheckerRegistry } from "./infrastructure/checkers/registry";
import { HttpChecker } from "./infrastructure/checkers/http.checker";
import { PingChecker } from "./infrastructure/checkers/ping.checker";
import { PortChecker } from "./infrastructure/checkers/port.checker";
import { DnsChecker } from "./infrastructure/checkers/dns.checker";
import { SnmpChecker } from "./infrastructure/checkers/snmp.checker";
import { InMemoryScheduler } from "./infrastructure/scheduler/in-memory-scheduler";
import { HttpsServerManager } from "./infrastructure/http/https-server-manager";
import { encryptPrivateKey, decryptPrivateKey } from "./infrastructure/security/tls-key-cipher";
import { SmtpMailer } from "./infrastructure/notifier/smtp-mailer";
import { ResolveAppSmtpConfig } from "./application/services/resolve-app-smtp-config";
import { ResolveMonitoringEngineConfig } from "./application/services/resolve-monitoring-engine-config";
import { ResolveDefaultAlertRecipients } from "./application/services/resolve-default-alert-recipients";
import { PdfmakeReportRenderer } from "./infrastructure/reporting/pdfmake-report-renderer";
import { FederationFetchClient } from "./infrastructure/security/federation-fetch-client";

// Use cases
import { RegisterUseCase } from "./application/use-cases/auth/register.usecase";
import { LoginUseCase } from "./application/use-cases/auth/login.usecase";
import { RefreshUseCase } from "./application/use-cases/auth/refresh.usecase";
import { RequestPasswordResetUseCase } from "./application/use-cases/auth/request-password-reset.usecase";
import { ResetPasswordUseCase } from "./application/use-cases/auth/reset-password.usecase";
import { CreateMonitorUseCase } from "./application/use-cases/monitors/create-monitor.usecase";
import { ListMonitorsUseCase } from "./application/use-cases/monitors/list-monitors.usecase";
import { UpdateMonitorUseCase } from "./application/use-cases/monitors/update-monitor.usecase";
import { DeleteMonitorUseCase } from "./application/use-cases/monitors/delete-monitor.usecase";
import { BulkDeleteMonitorsUseCase } from "./application/use-cases/monitors/bulk-delete-monitors.usecase";
import { ExecuteCheckUseCase } from "./application/use-cases/monitoring/execute-check.usecase";
import { GetHistoryUseCase } from "./application/use-cases/stats/get-history.usecase";
import { GetGroupsUseCase } from "./application/use-cases/stats/get-groups.usecase";
import { GetGroupOverviewUseCase } from "./application/use-cases/stats/get-group-overview.usecase";
import { GetRecentEventsUseCase } from "./application/use-cases/stats/get-recent-events.usecase";
import { GetMonitorEventsUseCase } from "./application/use-cases/stats/get-monitor-events.usecase";
import { GetGroupEventsUseCase } from "./application/use-cases/stats/get-group-events.usecase";
import { CreateMaintenanceWindowUseCase } from "./application/use-cases/maintenance/create-maintenance-window.usecase";
import { ListMaintenanceWindowsUseCase } from "./application/use-cases/maintenance/list-maintenance-windows.usecase";
import { UpdateMaintenanceWindowUseCase } from "./application/use-cases/maintenance/update-maintenance-window.usecase";
import { EndMaintenanceWindowUseCase } from "./application/use-cases/maintenance/end-maintenance-window.usecase";
import { DeleteMaintenanceWindowUseCase } from "./application/use-cases/maintenance/delete-maintenance-window.usecase";
import { CreateReportDefinitionUseCase } from "./application/use-cases/reports/create-report-definition.usecase";
import { ListReportDefinitionsUseCase } from "./application/use-cases/reports/list-report-definitions.usecase";
import { UpdateReportDefinitionUseCase } from "./application/use-cases/reports/update-report-definition.usecase";
import { DeleteReportDefinitionUseCase } from "./application/use-cases/reports/delete-report-definition.usecase";
import { GenerateReportDataUseCase } from "./application/use-cases/reports/generate-report-data.usecase";
import { SendReportEmailUseCase } from "./application/use-cases/reports/send-report-email.usecase";
import { SendTestReportUseCase } from "./application/use-cases/reports/send-test-report.usecase";
import { DownloadReportPdfUseCase } from "./application/use-cases/reports/download-report-pdf.usecase";
import { RunScheduledReportsUseCase } from "./application/use-cases/reports/run-scheduled-reports.usecase";

// Use cases de Viewers y Backup
import { ListViewersUseCase } from "./application/use-cases/users/list-viewers.usecase";
import { CreateViewerUseCase } from "./application/use-cases/users/create-viewer.usecase";
import { CreateAdminUseCase } from "./application/use-cases/users/create-admin.usecase";
import { ListAdminsUseCase } from "./application/use-cases/users/list-admins.usecase";
import { UpdateAdminUseCase } from "./application/use-cases/users/update-admin.usecase";
import { SetAdminBlockedUseCase } from "./application/use-cases/users/set-admin-blocked.usecase";
import { DeleteAdminUseCase } from "./application/use-cases/users/delete-admin.usecase";
import { UpdateViewerPermissionsUseCase } from "./application/use-cases/users/update-viewer-permissions.usecase";
import { DeleteViewerUseCase } from "./application/use-cases/users/delete-viewer.usecase";
import { CreateBackupUseCase } from "./application/use-cases/backup/create-backup.usecase";
import { ListBackupsUseCase } from "./application/use-cases/backup/list-backups.usecase";
import { GetBackupUseCase } from "./application/use-cases/backup/get-backup.usecase";
import { ImportBackupUseCase } from "./application/use-cases/backup/import-backup.usecase";
import { PurgeInstanceUseCase } from "./application/use-cases/backup/purge-instance.usecase";
import { GetPurgePreviewUseCase } from "./application/use-cases/backup/get-purge-preview.usecase";
import { DeleteBackupUseCase } from "./application/use-cases/backup/delete-backup.usecase";
import { BulkImportMonitorsFromCsvUseCase } from "./application/use-cases/backup/bulk-import-monitors-from-csv.usecase";
import { ExportMonitorAssetsUseCase } from "./application/use-cases/monitors/export-monitor-assets.usecase";
import { ImportMonitorAssetsUseCase } from "./application/use-cases/monitors/import-monitor-assets.usecase";
import { BulkAssignNotificationUseCase } from "./application/use-cases/monitors/bulk-assign-notification.usecase";

// Use cases de Notificaciones
import { CreateNotificationUseCase } from "./application/use-cases/notifications/create-notification.usecase";
import { ListNotificationsUseCase } from "./application/use-cases/notifications/list-notifications.usecase";
import { UpdateNotificationUseCase } from "./application/use-cases/notifications/update-notification.usecase";
import { DeleteNotificationUseCase } from "./application/use-cases/notifications/delete-notification.usecase";
import { TestNotificationUseCase } from "./application/use-cases/notifications/test-notification.usecase";

// Use cases de Sistema (TLS/HTTPS)
import { ApplyTlsConfigUseCase } from "./application/use-cases/system/apply-tls-config.usecase";
import { GetTlsConfigUseCase } from "./application/use-cases/system/get-tls-config.usecase";
import { GetSmtpStatusUseCase } from "./application/use-cases/system/get-smtp-status.usecase";
import { SendTestEmailUseCase } from "./application/use-cases/system/send-test-email.usecase";
import { GetAppSmtpChannelUseCase } from "./application/use-cases/system/get-app-smtp-channel.usecase";
import { SetAppSmtpChannelUseCase } from "./application/use-cases/system/set-app-smtp-channel.usecase";
import { GetMonitoringEngineSettingsUseCase } from "./application/use-cases/system/get-monitoring-engine-settings.usecase";
import { SetMonitoringEngineSettingsUseCase } from "./application/use-cases/system/set-monitoring-engine-settings.usecase";

// Use cases de API Keys (API pública)
import { CreateApiKeyUseCase } from "./application/use-cases/api-keys/create-api-key.usecase";
import { ListApiKeysUseCase } from "./application/use-cases/api-keys/list-api-keys.usecase";
import { RevokeApiKeyUseCase } from "./application/use-cases/api-keys/revoke-api-key.usecase";
import { DeleteApiKeyUseCase } from "./application/use-cases/api-keys/delete-api-key.usecase";
import { ListAuditLogUseCase } from "./application/use-cases/audit-log/list-audit-log.usecase";

// Use cases de Federación de instancias (AZ-049, slice 1: enrollment)
import { CreateEnrollmentTokenUseCase } from "./application/use-cases/federation/create-enrollment-token.usecase";
import { JoinFederationUseCase } from "./application/use-cases/federation/join-federation.usecase";
import { AcceptEnrollmentUseCase } from "./application/use-cases/federation/accept-enrollment.usecase";
import { GetFederationOwnUrlUseCase } from "./application/use-cases/federation/get-federation-own-url.usecase";
import { SetFederationOwnUrlUseCase } from "./application/use-cases/federation/set-federation-own-url.usecase";
import { TestAddressConnectionUseCase } from "./application/use-cases/federation/test-address-connection.usecase";
import { TestFederatedInstanceConnectionUseCase } from "./application/use-cases/federation/test-federated-instance-connection.usecase";
import { ListFederatedInstancesUseCase } from "./application/use-cases/federation/list-federated-instances.usecase";
import { RevokeFederatedInstanceUseCase } from "./application/use-cases/federation/revoke-federated-instance.usecase";
import { ReactivateFederatedInstanceUseCase } from "./application/use-cases/federation/reactivate-federated-instance.usecase";
import { DeleteFederatedInstanceUseCase } from "./application/use-cases/federation/delete-federated-instance.usecase";
import { ListLocalMonitorsForPeerUseCase } from "./application/use-cases/federation/list-local-monitors-for-peer.usecase";
import { ListRemoteMonitorsUseCase } from "./application/use-cases/federation/list-remote-monitors.usecase";
import { CreateFederatedMonitorLinkUseCase } from "./application/use-cases/federation/create-federated-monitor-link.usecase";
import { AutoLinkFederatedMonitorsUseCase } from "./application/use-cases/federation/auto-link-federated-monitors.usecase";
import { ListFederatedMonitorLinksUseCase } from "./application/use-cases/federation/list-federated-monitor-links.usecase";
import { DeleteFederatedMonitorLinkUseCase } from "./application/use-cases/federation/delete-federated-monitor-link.usecase";
import { RunFederationSyncUseCase } from "./application/use-cases/federation/run-federation-sync.usecase";
import { RespondToSyncRequestUseCase } from "./application/use-cases/federation/respond-to-sync-request.usecase";
import { GetFederatedComparisonUseCase } from "./application/use-cases/federation/get-federated-comparison.usecase";
import { FEDERATION_SYNC_INTERVAL_MINUTES } from "./application/use-cases/federation/federation-limits";

// HTTP
import { AuthController } from "./infrastructure/http/controllers/auth.controller";
import { MonitorController } from "./infrastructure/http/controllers/monitor.controller";
import { StatsController } from "./infrastructure/http/controllers/stats.controller";
import { UserController } from "./infrastructure/http/controllers/user.controller";
import { BackupController } from "./infrastructure/http/controllers/backup.controller";
import { NotificationController } from "./infrastructure/http/controllers/notification.controller";
import { SystemController } from "./infrastructure/http/controllers/system.controller";
import { ApiKeyController } from "./infrastructure/http/controllers/api-key.controller";
import { AuditLogController } from "./infrastructure/http/controllers/audit-log.controller";
import { MaintenanceController } from "./infrastructure/http/controllers/maintenance.controller";
import { ReportController } from "./infrastructure/http/controllers/report.controller";
import { FederationController } from "./infrastructure/http/controllers/federation.controller";
import { FederationPeerController } from "./infrastructure/http/controllers/federation-peer.controller";

import { authRoutes } from "./infrastructure/http/routes/auth.routes";
import { monitorRoutes } from "./infrastructure/http/routes/monitor.routes";
import { statsRoutes } from "./infrastructure/http/routes/stats.routes";
import { userRoutes } from "./infrastructure/http/routes/user.routes";
import { backupRoutes } from "./infrastructure/http/routes/backup.routes";
import { notificationRoutes } from "./infrastructure/http/routes/notification.routes";
import { systemRoutes } from "./infrastructure/http/routes/system.routes";
import { apiKeyRoutes } from "./infrastructure/http/routes/api-key.routes";
import { auditLogRoutes } from "./infrastructure/http/routes/audit-log.routes";
import { maintenanceRoutes } from "./infrastructure/http/routes/maintenance.routes";
import { reportRoutes } from "./infrastructure/http/routes/report.routes";
import { federationRoutes } from "./infrastructure/http/routes/federation.routes";
import { federationPeerRoutes } from "./infrastructure/http/routes/federation-peer.routes";
import { makeVerifyPeerSecret } from "./infrastructure/http/middlewares/verify-peer-secret";

import { makeAuthGuard } from "./infrastructure/http/middlewares/auth-guard";
import { makeApiKeyAuth } from "./infrastructure/http/middlewares/api-key-auth";
import { makeMetricsAuth } from "./infrastructure/http/middlewares/metrics-auth";
import { errorHandler } from "./infrastructure/http/middlewares/error-handler";
import { licenseNotice } from "./infrastructure/http/middlewares/license-notice";
import { asyncHandler } from "./infrastructure/http/middlewares/async-handler";
import { GetMetricsUseCase } from "./application/use-cases/system/get-metrics.usecase";
import { MetricsController } from "./infrastructure/http/controllers/metrics.controller";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appVersion: string = require("../package.json").version;

export interface AppContainer {
  server: http.Server;
  scheduler: IScheduler;
  tlsServerManager: ITlsServerManager;
  tlsConfigs: ITlsConfigRepository;
  tlsEncryptionKey?: string;
}

/**
 * Composition root: instancia y cablea todas las dependencias (DI manual).
 * El orden respeta la regla: io necesita el server; el resto se construye después
 * y las rutas se montan sobre el app ya creado.
 */
export function buildContainer(env: Env): AppContainer {
  const app = express();
  // Confía en el primer hop (nginx del contenedor frontend) para resolver la IP real del
  // cliente desde X-Forwarded-For — requerido para que express-rate-limit limite
  // por IP de cliente real y no por la IP interna del proxy.
  app.set("trust proxy", 1);
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(licenseNotice);

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.corsOrigin } });
  const tlsServerManager = new HttpsServerManager(app);

  // Redirección opcional HTTP -> HTTPS. Nota operativa: si el backend corre detrás de un
  // proxy (ej. nginx) que le reenvía tráfico por HTTP interno, habilitar esta opción redirigirá
  // también ese tráfico interno; solo se recomienda cuando el backend recibe tráfico público directo.
  app.use((req, res, next) => {
    const status = tlsServerManager.getStatus();
    if (status.active && status.httpRedirect && !req.secure) {
      res.redirect(301, `https://${req.hostname}:${status.port}${req.originalUrl}`);
      return;
    }
    next();
  });

  // Seguridad
  const tokens = new JwtTokenService(env.jwtSecret, env.jwtExpiresInSeconds);
  const hasher = new BcryptPasswordHasher(env.bcryptCost);

  // Repositorios
  const users = new MongooseUserRepository();
  const monitors = new MongooseMonitorRepository();
  const heartbeats = new MongooseHeartbeatRepository();
  const notifications = new MongooseNotificationRepository();
  const backupsRepo = new MongooseBackupRepository();
  const auditLog = new MongooseAuditLogRepository();
  const apiKeysRepo = new MongooseApiKeyRepository();
  const tlsConfigs = new MongooseTlsConfigRepository();
  const appSmtpSettingsRepo = new MongooseAppSmtpSettingsRepository();
  const maintenanceRepo = new MongooseMaintenanceRepository();
  const monitoringEngineSettingsRepo = new MongooseMonitoringEngineSettingsRepository();
  const reportDefinitionsRepo = new MongooseReportDefinitionRepository();
  const federatedInstancesRepo = new MongooseFederatedInstanceRepository();
  const federationTokensRepo = new MongooseFederationEnrollmentTokenRepository();
  const federatedMonitorLinksRepo = new MongooseFederatedMonitorLinkRepository();
  const federatedHeartbeatsRepo = new MongooseFederatedHeartbeatRepository();
  const federationSettingsRepo = new MongooseFederationSettingsRepository();
  // Dirección pública guardada una sola vez por el Admin (ver SetFederationOwnUrlUseCase) — se
  // reutiliza al invitar y al unirse, en vez de pedirla a mano en cada una. `null` si todavía no
  // se configuró (los use-cases que la necesitan lanzan un error claro pidiendo configurarla).
  const resolveOwnUrl = async (): Promise<string | null> => (await federationSettingsRepo.getActive())?.ownUrl ?? null;
  // Federación de instancias (AZ-049): el secreto compartido de cada par se cifra en reposo con
  // la misma clave que ya cifra la clave privada TLS (AZKIN_TLS_ENCRYPTION_KEY, derivada sola de
  // AZKIN_JWT_SECRET si no se configuró explícita) — reutiliza tls-key-cipher.ts tal cual.
  const federationEncryptionKey = env.tlsEncryptionKey ?? "";
  const federationClient = new FederationFetchClient();

  // SMTP de aplicación: por defecto AZKIN_SMTP_* del .env, o el de un canal de notificación
  // "email" reutilizado si el admin eligió uno (ver ResolveAppSmtpConfig).
  const smtpConfigResolver = new ResolveAppSmtpConfig(appSmtpSettingsRepo, notifications, env.smtp);
  const mailer = new SmtpMailer(smtpConfigResolver);
  // "Correo de alertas global" para informes (AZ-045): reutiliza el mismo canal ya elegido como
  // SMTP de Aplicación, tomando su destinatario configurado (ver ResolveDefaultAlertRecipients).
  const defaultAlertRecipients = new ResolveDefaultAlertRecipients(appSmtpSettingsRepo, notifications);
  const reportPdfRenderer = new PdfmakeReportRenderer();

  // Configuración del motor de monitoreo: por defecto AZKIN_DEGRADED_LATENCY_MS/
  // AZKIN_ACCELERATED_INTERVAL_SECONDS del .env, o el override que haya guardado un Admin
  // desde /settings (ver ResolveMonitoringEngineConfig).
  const monitoringConfigResolver = new ResolveMonitoringEngineConfig(monitoringEngineSettingsRepo, {
    degradedLatencyMs: env.degradedLatencyMs,
    acceleratedIntervalSeconds: env.acceleratedIntervalSeconds,
  });

  // Tiempo real + alertas
  const publisher = new SocketIoGateway(io, tokens);
  const notifier = new MultichannelNotifier(notifications);

  // Checkers + concurrencia
  const limit = pLimit(env.checkConcurrency);
  const registry = new CheckerRegistry(
    [new HttpChecker(), new PingChecker(), new PortChecker(), new DnsChecker(), new SnmpChecker()],
    limit,
  );

  // Motor de monitoreo
  const executeCheck = new ExecuteCheckUseCase(
    registry,
    heartbeats,
    publisher,
    notifier,
    maintenanceRepo,
    monitoringConfigResolver,
  );
  const scheduler = new InMemoryScheduler(monitors, executeCheck, heartbeats, publisher, notifier, env.firstCheckDelayMs);

  // Casos de uso
  const register = new RegisterUseCase(users, hasher, tokens);
  const login = new LoginUseCase(users, hasher, tokens, auditLog);
  const refresh = new RefreshUseCase(users, tokens);
  const requestPasswordReset = new RequestPasswordResetUseCase(users, mailer, auditLog);
  const resetPassword = new ResetPasswordUseCase(users, hasher, auditLog);
  const createMonitor = new CreateMonitorUseCase(monitors, scheduler, auditLog);
  const listMonitors = new ListMonitorsUseCase(monitors, heartbeats);
  const updateMonitor = new UpdateMonitorUseCase(monitors, scheduler, auditLog);
  const deleteMonitor = new DeleteMonitorUseCase(monitors, heartbeats, scheduler, auditLog);
  const bulkDeleteMonitors = new BulkDeleteMonitorsUseCase(monitors, heartbeats, scheduler, auditLog);
  const bulkImportMonitorsFromCsv = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);
  const exportMonitorAssets = new ExportMonitorAssetsUseCase(monitors);
  const importMonitorAssets = new ImportMonitorAssetsUseCase(monitors, scheduler, auditLog);
  const bulkAssignNotification = new BulkAssignNotificationUseCase(monitors, scheduler, auditLog);
  const getHistory = new GetHistoryUseCase(monitors, heartbeats);
  const getGroups = new GetGroupsUseCase(monitors);
  const getGroupOverview = new GetGroupOverviewUseCase(monitors, heartbeats);
  const getRecentEvents = new GetRecentEventsUseCase(monitors, heartbeats);
  const getMonitorEvents = new GetMonitorEventsUseCase(monitors, heartbeats);
  const getGroupEvents = new GetGroupEventsUseCase(monitors, heartbeats);
  const createMaintenanceWindow = new CreateMaintenanceWindowUseCase(maintenanceRepo, auditLog);
  const listMaintenanceWindows = new ListMaintenanceWindowsUseCase(maintenanceRepo);
  const updateMaintenanceWindow = new UpdateMaintenanceWindowUseCase(maintenanceRepo, auditLog);
  const endMaintenanceWindow = new EndMaintenanceWindowUseCase(maintenanceRepo, auditLog);
  const deleteMaintenanceWindow = new DeleteMaintenanceWindowUseCase(maintenanceRepo, auditLog);

  // Informes periódicos de disponibilidad (AZ-045)
  const createReportDefinition = new CreateReportDefinitionUseCase(reportDefinitionsRepo, auditLog);
  const listReportDefinitions = new ListReportDefinitionsUseCase(reportDefinitionsRepo);
  const updateReportDefinition = new UpdateReportDefinitionUseCase(reportDefinitionsRepo, auditLog);
  const deleteReportDefinition = new DeleteReportDefinitionUseCase(reportDefinitionsRepo, auditLog);
  const generateReportData = new GenerateReportDataUseCase(monitors, heartbeats);
  const sendReportEmail = new SendReportEmailUseCase(
    generateReportData,
    reportPdfRenderer,
    mailer,
    defaultAlertRecipients,
    reportDefinitionsRepo,
  );
  const sendTestReport = new SendTestReportUseCase(reportDefinitionsRepo, sendReportEmail, auditLog);
  const downloadReportPdf = new DownloadReportPdfUseCase(reportDefinitionsRepo, generateReportData, reportPdfRenderer);
  const runScheduledReports = new RunScheduledReportsUseCase(reportDefinitionsRepo, sendReportEmail);

  // Instanciación de Use cases de Viewers y Backup
  const listViewers = new ListViewersUseCase(users);
  const createViewer = new CreateViewerUseCase(users, hasher, auditLog);
  const createAdmin = new CreateAdminUseCase(users, hasher, auditLog);
  const listAdmins = new ListAdminsUseCase(users);
  const updateAdmin = new UpdateAdminUseCase(users, auditLog);
  const setAdminBlocked = new SetAdminBlockedUseCase(users, auditLog);
  const deleteAdmin = new DeleteAdminUseCase(users, auditLog);
  const updateViewerPermissions = new UpdateViewerPermissionsUseCase(users, auditLog);
  const deleteViewer = new DeleteViewerUseCase(users, auditLog);
  const createBackup = new CreateBackupUseCase(monitors, backupsRepo, auditLog, notifications, users, tlsConfigs);
  const listBackups = new ListBackupsUseCase(backupsRepo);
  const getBackup = new GetBackupUseCase(backupsRepo, auditLog);
  const importBackup = new ImportBackupUseCase(monitors, scheduler, notifications, users, tlsConfigs, auditLog);
  const purgeInstance = new PurgeInstanceUseCase(
    users,
    monitors,
    notifications,
    apiKeysRepo,
    auditLog,
    tlsConfigs,
    backupsRepo,
    scheduler,
  );
  const getPurgePreview = new GetPurgePreviewUseCase(users);
  const deleteBackup = new DeleteBackupUseCase(backupsRepo, auditLog);

  // Instanciación de Use cases de Notificaciones
  const listNotifications = new ListNotificationsUseCase(notifications);
  const createNotification = new CreateNotificationUseCase(notifications, auditLog);
  const updateNotification = new UpdateNotificationUseCase(notifications, auditLog);
  const deleteNotification = new DeleteNotificationUseCase(notifications, monitors, scheduler, auditLog);
  const testNotification = new TestNotificationUseCase(notifications, notifier);

  // Instanciación de Use cases de Sistema (TLS/HTTPS)
  const applyTlsConfig = new ApplyTlsConfigUseCase(
    tlsConfigs,
    auditLog,
    tlsServerManager,
    encryptPrivateKey,
    env.tlsEncryptionKey ?? "",
  );
  const getTlsConfig = new GetTlsConfigUseCase(tlsConfigs, tlsServerManager);
  const getAppSmtpChannel = new GetAppSmtpChannelUseCase(appSmtpSettingsRepo, notifications);
  const setAppSmtpChannel = new SetAppSmtpChannelUseCase(appSmtpSettingsRepo, notifications, auditLog);
  const getMonitoringEngineSettings = new GetMonitoringEngineSettingsUseCase(monitoringEngineSettingsRepo, {
    degradedLatencyMs: env.degradedLatencyMs,
    acceleratedIntervalSeconds: env.acceleratedIntervalSeconds,
  });
  const setMonitoringEngineSettings = new SetMonitoringEngineSettingsUseCase(monitoringEngineSettingsRepo, auditLog);

  // Instanciación de Use cases de API Keys (API pública)
  const createApiKey = new CreateApiKeyUseCase(apiKeysRepo, auditLog);
  const listApiKeys = new ListApiKeysUseCase(apiKeysRepo);
  const revokeApiKey = new RevokeApiKeyUseCase(apiKeysRepo, auditLog);
  const deleteApiKey = new DeleteApiKeyUseCase(apiKeysRepo, auditLog);

  // Controllers
  const authController = new AuthController(register, login, refresh, requestPasswordReset, resetPassword, users, env.appUrl);
  const monitorController = new MonitorController(
    createMonitor,
    listMonitors,
    updateMonitor,
    deleteMonitor,
    bulkDeleteMonitors,
    bulkImportMonitorsFromCsv,
    exportMonitorAssets,
    importMonitorAssets,
    bulkAssignNotification,
  );
  const statsController = new StatsController(getHistory, getGroups, getGroupOverview, getRecentEvents, getMonitorEvents, getGroupEvents);
  const userController = new UserController(
    listViewers,
    createViewer,
    updateViewerPermissions,
    deleteViewer,
    createAdmin,
    listAdmins,
    updateAdmin,
    setAdminBlocked,
    deleteAdmin,
    users,
    hasher,
    auditLog,
  );
  const backupController = new BackupController(
    createBackup,
    listBackups,
    getBackup,
    importBackup,
    purgeInstance,
    getPurgePreview,
    deleteBackup,
    env.firstAdminEmail,
    env.firstAdminName,
  );
  const notificationController = new NotificationController(
    listNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    testNotification,
  );
  const getSmtpStatus = new GetSmtpStatusUseCase();
  const sendTestEmail = new SendTestEmailUseCase(mailer);
  const systemController = new SystemController(
    applyTlsConfig,
    getTlsConfig,
    getSmtpStatus,
    sendTestEmail,
    smtpConfigResolver,
    getAppSmtpChannel,
    setAppSmtpChannel,
    getMonitoringEngineSettings,
    setMonitoringEngineSettings,
  );
  const apiKeyController = new ApiKeyController(createApiKey, listApiKeys, revokeApiKey, deleteApiKey);
  const listAuditLog = new ListAuditLogUseCase(auditLog, users);
  const auditLogController = new AuditLogController(listAuditLog);

  // Instanciación de Use cases de Federación de instancias (AZ-049, slice 1: enrollment)
  const createEnrollmentToken = new CreateEnrollmentTokenUseCase(federationTokensRepo, auditLog, resolveOwnUrl);
  const joinFederation = new JoinFederationUseCase(
    federatedInstancesRepo,
    federationClient,
    auditLog,
    resolveOwnUrl,
    encryptPrivateKey,
    federationEncryptionKey,
  );
  const acceptEnrollment = new AcceptEnrollmentUseCase(
    federationTokensRepo,
    federatedInstancesRepo,
    auditLog,
    encryptPrivateKey,
    federationEncryptionKey,
    publisher,
  );
  const getFederationOwnUrl = new GetFederationOwnUrlUseCase(federationSettingsRepo);
  const setFederationOwnUrl = new SetFederationOwnUrlUseCase(federationSettingsRepo, auditLog);
  const testAddressConnection = new TestAddressConnectionUseCase();
  const testFederatedInstanceConnection = new TestFederatedInstanceConnectionUseCase(federatedInstancesRepo);
  const listFederatedInstances = new ListFederatedInstancesUseCase(federatedInstancesRepo);
  const revokeFederatedInstance = new RevokeFederatedInstanceUseCase(
    federatedInstancesRepo,
    auditLog,
    federationClient,
    decryptPrivateKey,
    federationEncryptionKey,
  );
  const reactivateFederatedInstance = new ReactivateFederatedInstanceUseCase(federatedInstancesRepo, auditLog);
  const deleteFederatedInstance = new DeleteFederatedInstanceUseCase(
    federatedInstancesRepo,
    federatedMonitorLinksRepo,
    auditLog,
  );
  const listLocalMonitorsForPeer = new ListLocalMonitorsForPeerUseCase(monitors, heartbeats);
  const listRemoteMonitors = new ListRemoteMonitorsUseCase(federatedInstancesRepo, federationClient, decryptPrivateKey, federationEncryptionKey);
  const createFederatedMonitorLink = new CreateFederatedMonitorLinkUseCase(
    federatedMonitorLinksRepo,
    federatedInstancesRepo,
    monitors,
    auditLog,
  );
  const listFederatedMonitorLinks = new ListFederatedMonitorLinksUseCase(federatedMonitorLinksRepo);
  const deleteFederatedMonitorLink = new DeleteFederatedMonitorLinkUseCase(federatedMonitorLinksRepo, auditLog);
  const getFederatedComparison = new GetFederatedComparisonUseCase(
    federatedMonitorLinksRepo,
    federatedInstancesRepo,
    federatedHeartbeatsRepo,
    heartbeats,
    monitors,
  );
  const runFederationSync = new RunFederationSyncUseCase(
    federatedInstancesRepo,
    federatedMonitorLinksRepo,
    federatedHeartbeatsRepo,
    federationClient,
    mailer,
    defaultAlertRecipients,
    decryptPrivateKey,
    federationEncryptionKey,
    heartbeats,
  );
  const autoLinkFederatedMonitors = new AutoLinkFederatedMonitorsUseCase(
    federatedInstancesRepo,
    federatedMonitorLinksRepo,
    monitors,
    listRemoteMonitors,
    auditLog,
    heartbeats,
  );
  autoLinkFederatedMonitors.setSyncTrigger(() => runFederationSync.execute());
  createFederatedMonitorLink.setSyncTrigger(() => runFederationSync.execute());
  acceptEnrollment.setOnEnrolledCallback(async (instanceId, createdById) => {
    await autoLinkFederatedMonitors.execute(createdById, instanceId);
  });
  joinFederation.setOnEnrolledCallback(async (instanceId, createdById) => {
    await autoLinkFederatedMonitors.execute(createdById, instanceId);
  });

  const federationController = new FederationController(
    createEnrollmentToken,
    joinFederation,
    acceptEnrollment,
    listFederatedInstances,
    revokeFederatedInstance,
    reactivateFederatedInstance,
    deleteFederatedInstance,
    listRemoteMonitors,
    createFederatedMonitorLink,
    autoLinkFederatedMonitors,
    listFederatedMonitorLinks,
    deleteFederatedMonitorLink,
    getFederatedComparison,
    getFederationOwnUrl,
    setFederationOwnUrl,
    testAddressConnection,
    testFederatedInstanceConnection,
  );
  const respondToSyncRequest = new RespondToSyncRequestUseCase(heartbeats);
  const federationPeerController = new FederationPeerController(
    listLocalMonitorsForPeer,
    respondToSyncRequest,
    federatedInstancesRepo,
  );
  const maintenanceController = new MaintenanceController(
    createMaintenanceWindow,
    listMaintenanceWindows,
    updateMaintenanceWindow,
    endMaintenanceWindow,
    deleteMaintenanceWindow,
  );
  const reportController = new ReportController(
    createReportDefinition,
    listReportDefinitions,
    updateReportDefinition,
    deleteReportDefinition,
    sendTestReport,
    downloadReportPdf,
  );
  const getMetrics = new GetMetricsUseCase(monitors, heartbeats);
  const metricsController = new MetricsController(getMetrics);

  // Rutas
  const authGuard = makeAuthGuard(tokens);
  const apiKeyAuth = makeApiKeyAuth(apiKeysRepo);
  const metricsAuth = makeMetricsAuth(env);
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: appVersion, uptimeSeconds: Math.floor(process.uptime()) });
  });

  app.get("/metrics", metricsAuth, asyncHandler(metricsController.handle));

  app.use("/api/v1/auth", authRoutes(authController));
  app.use("/api/v1/monitors", authGuard, monitorRoutes(monitorController));
  app.use("/api/v1/stats", authGuard, statsRoutes(statsController));
  app.use("/api/v1/users", authGuard, userRoutes(userController));
  app.use("/api/v1/backup", authGuard, backupRoutes(backupController));
  app.use("/api/v1/notifications", authGuard, notificationRoutes(notificationController));
  app.use("/api/v1/system", authGuard, systemRoutes(systemController));
  app.use("/api/v1/api-keys", authGuard, apiKeyRoutes(apiKeyController));
  app.use("/api/v1/audit-log", authGuard, auditLogRoutes(auditLogController));
  app.use("/api/v1/maintenance", authGuard, maintenanceRoutes(maintenanceController));
  app.use("/api/v1/reports", authGuard, reportRoutes(reportController));
  // Sin authGuard a nivel de mount: /enrollments es pública (la llama el backend de la instancia
  // remota, no un usuario con sesión); /tokens e /instances aplican authGuard+requireRole("admin")
  // dentro del propio router (ver federation.routes.ts), igual que auth.routes.ts con /login.
  app.use("/api/v1/federation", federationRoutes(federationController, authGuard));
  // Endpoints peer-to-peer (AZ-049): corren sobre el mismo app/puerto que el resto de la API, sin
  // sesión JWT — la autorización es el secreto compartido en el header X-Federation-Secret (ver
  // verify-peer-secret.ts), no un certificado de cliente ni un listener dedicado.
  const verifyPeerSecret = makeVerifyPeerSecret(federatedInstancesRepo, decryptPrivateKey, federationEncryptionKey);
  app.use("/api/v1/federation/peer", federationPeerRoutes(federationPeerController, verifyPeerSecret));
  // API pública autenticada por API Key en vez de sesión JWT — reutiliza el mismo
  // MonitorController/monitorRoutes, sin duplicar lógica de negocio.
  app.use("/api/public/v1/monitors", apiKeyAuth, monitorRoutes(monitorController));
  app.use(errorHandler);

  // Tick del cron de informes periódicos (AZ-045): cada 15 minutos evalúa qué definiciones
  // habilitadas coinciden con su hora/día configurado y las envía. `RunScheduledReportsUseCase`
  // ya captura errores por definición individualmente; este catch es solo una red de seguridad
  // ante un fallo catastrófico (ej. Mongo caído al listar definiciones).
  cron.schedule("*/15 * * * *", () => {
    runScheduledReports.execute().catch((err) => {
      logger.error(`[Reports] Fallo inesperado en el tick del cron de informes: ${getErrorMessage(err)}`);
    });
  });

  // Tick de sondeo periódico de federación (AZ-049, slice 2): `RunFederationSyncUseCase` ya
  // captura errores por instancia/vínculo individualmente; este catch es solo red de seguridad.
  cron.schedule(`*/${FEDERATION_SYNC_INTERVAL_MINUTES} * * * *`, () => {
    runFederationSync.execute().catch((err) => {
      logger.error(`[Federation] Fallo inesperado en el tick de sondeo: ${getErrorMessage(err)}`);
    });
  });

  return {
    server,
    scheduler,
    tlsServerManager,
    tlsConfigs,
    tlsEncryptionKey: env.tlsEncryptionKey,
  };
}


