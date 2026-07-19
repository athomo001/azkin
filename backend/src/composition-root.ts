// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import http from "http";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import pLimit from "p-limit";
import { Server } from "socket.io";

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
import { encryptPrivateKey } from "./infrastructure/security/tls-key-cipher";
import { SmtpMailer } from "./infrastructure/notifier/smtp-mailer";

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
import { BulkImportMonitorsFromCsvUseCase } from "./application/use-cases/backup/bulk-import-monitors-from-csv.usecase";

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

// Use cases de API Keys (API pública, AZ-029)
import { CreateApiKeyUseCase } from "./application/use-cases/api-keys/create-api-key.usecase";
import { ListApiKeysUseCase } from "./application/use-cases/api-keys/list-api-keys.usecase";
import { RevokeApiKeyUseCase } from "./application/use-cases/api-keys/revoke-api-key.usecase";
import { ListAuditLogUseCase } from "./application/use-cases/audit-log/list-audit-log.usecase";

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

import { authRoutes } from "./infrastructure/http/routes/auth.routes";
import { monitorRoutes } from "./infrastructure/http/routes/monitor.routes";
import { statsRoutes } from "./infrastructure/http/routes/stats.routes";
import { userRoutes } from "./infrastructure/http/routes/user.routes";
import { backupRoutes } from "./infrastructure/http/routes/backup.routes";
import { notificationRoutes } from "./infrastructure/http/routes/notification.routes";
import { systemRoutes } from "./infrastructure/http/routes/system.routes";
import { apiKeyRoutes } from "./infrastructure/http/routes/api-key.routes";
import { auditLogRoutes } from "./infrastructure/http/routes/audit-log.routes";

import { makeAuthGuard } from "./infrastructure/http/middlewares/auth-guard";
import { makeApiKeyAuth } from "./infrastructure/http/middlewares/api-key-auth";
import { makeMetricsAuth } from "./infrastructure/http/middlewares/metrics-auth";
import { errorHandler } from "./infrastructure/http/middlewares/error-handler";
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
  // cliente desde X-Forwarded-For — requerido para que express-rate-limit (AZ-010) limite
  // por IP de cliente real y no por la IP interna del proxy.
  app.set("trust proxy", 1);
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(cookieParser());

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.corsOrigin } });
  const tlsServerManager = new HttpsServerManager(app);

  // AZ-006: redirección opcional HTTP -> HTTPS. Nota operativa: si el backend corre detrás de un
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
  const mailer = new SmtpMailer(env.smtp);

  // Repositorios
  const users = new MongooseUserRepository();
  const monitors = new MongooseMonitorRepository();
  const heartbeats = new MongooseHeartbeatRepository();
  const notifications = new MongooseNotificationRepository();
  const backupsRepo = new MongooseBackupRepository();
  const auditLog = new MongooseAuditLogRepository();
  const apiKeysRepo = new MongooseApiKeyRepository();
  const tlsConfigs = new MongooseTlsConfigRepository();

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
  const executeCheck = new ExecuteCheckUseCase(registry, heartbeats, publisher, notifier);
  const scheduler = new InMemoryScheduler(monitors, executeCheck, heartbeats, publisher, notifier, env.firstCheckDelayMs);

  // Casos de uso
  const register = new RegisterUseCase(users, hasher, tokens);
  const login = new LoginUseCase(users, hasher, tokens);
  const refresh = new RefreshUseCase(users, tokens);
  const requestPasswordReset = new RequestPasswordResetUseCase(users, mailer, auditLog);
  const resetPassword = new ResetPasswordUseCase(users, hasher, auditLog);
  const createMonitor = new CreateMonitorUseCase(monitors, scheduler);
  const listMonitors = new ListMonitorsUseCase(monitors, heartbeats);
  const updateMonitor = new UpdateMonitorUseCase(monitors, scheduler);
  const deleteMonitor = new DeleteMonitorUseCase(monitors, heartbeats, scheduler);
  const bulkDeleteMonitors = new BulkDeleteMonitorsUseCase(monitors, heartbeats, scheduler, auditLog);
  const bulkImportMonitorsFromCsv = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler);
  const getHistory = new GetHistoryUseCase(monitors, heartbeats);
  const getGroups = new GetGroupsUseCase(monitors);
  const getGroupOverview = new GetGroupOverviewUseCase(monitors, heartbeats);
  const getRecentEvents = new GetRecentEventsUseCase(monitors, heartbeats);

  // Instanciación de Use cases de Viewers y Backup
  const listViewers = new ListViewersUseCase(users);
  const createViewer = new CreateViewerUseCase(users, hasher);
  const createAdmin = new CreateAdminUseCase(users, hasher);
  const listAdmins = new ListAdminsUseCase(users);
  const updateAdmin = new UpdateAdminUseCase(users);
  const setAdminBlocked = new SetAdminBlockedUseCase(users);
  const deleteAdmin = new DeleteAdminUseCase(users);
  const updateViewerPermissions = new UpdateViewerPermissionsUseCase(users);
  const deleteViewer = new DeleteViewerUseCase(users);
  const createBackup = new CreateBackupUseCase(monitors, backupsRepo, auditLog);
  const listBackups = new ListBackupsUseCase(backupsRepo);
  const getBackup = new GetBackupUseCase(backupsRepo);
  const importBackup = new ImportBackupUseCase(monitors, scheduler);

  // Instanciación de Use cases de Notificaciones
  const listNotifications = new ListNotificationsUseCase(notifications);
  const createNotification = new CreateNotificationUseCase(notifications);
  const updateNotification = new UpdateNotificationUseCase(notifications);
  const deleteNotification = new DeleteNotificationUseCase(notifications, monitors, scheduler);
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

  // Instanciación de Use cases de API Keys (API pública, AZ-029)
  const createApiKey = new CreateApiKeyUseCase(apiKeysRepo);
  const listApiKeys = new ListApiKeysUseCase(apiKeysRepo);
  const revokeApiKey = new RevokeApiKeyUseCase(apiKeysRepo);

  // Controllers
  const authController = new AuthController(register, login, refresh, requestPasswordReset, resetPassword, users, env.appUrl);
  const monitorController = new MonitorController(
    createMonitor,
    listMonitors,
    updateMonitor,
    deleteMonitor,
    bulkDeleteMonitors,
    bulkImportMonitorsFromCsv,
  );
  const statsController = new StatsController(getHistory, getGroups, getGroupOverview, getRecentEvents);
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
  );
  const backupController = new BackupController(createBackup, listBackups, getBackup, importBackup);
  const notificationController = new NotificationController(
    listNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    testNotification,
  );
  const getSmtpStatus = new GetSmtpStatusUseCase();
  const sendTestEmail = new SendTestEmailUseCase(mailer);
  const systemController = new SystemController(applyTlsConfig, getTlsConfig, getSmtpStatus, sendTestEmail, env.smtp);
  const apiKeyController = new ApiKeyController(createApiKey, listApiKeys, revokeApiKey);
  const listAuditLog = new ListAuditLogUseCase(auditLog, users);
  const auditLogController = new AuditLogController(listAuditLog);
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
  // AZ-029: API pública autenticada por API Key en vez de sesión JWT — reutiliza el mismo
  // MonitorController/monitorRoutes, sin duplicar lógica de negocio.
  app.use("/api/public/v1/monitors", apiKeyAuth, monitorRoutes(monitorController));
  app.use(errorHandler);

  return { server, scheduler, tlsServerManager, tlsConfigs, tlsEncryptionKey: env.tlsEncryptionKey };
}


