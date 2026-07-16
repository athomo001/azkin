import http from "http";
import cors from "cors";
import express from "express";
import pLimit from "p-limit";
import { Server } from "socket.io";

import { Env } from "./infrastructure/config/env";
import { IScheduler } from "./application/ports/services/scheduler";

// Repositories
import { MongooseUserRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-user.repository";
import { MongooseMonitorRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-monitor.repository";
import { MongooseHeartbeatRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository";
import { MongooseNotificationRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-notification.repository";

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

// Use cases
import { RegisterUseCase } from "./application/use-cases/auth/register.usecase";
import { LoginUseCase } from "./application/use-cases/auth/login.usecase";
import { CreateMonitorUseCase } from "./application/use-cases/monitors/create-monitor.usecase";
import { ListMonitorsUseCase } from "./application/use-cases/monitors/list-monitors.usecase";
import { UpdateMonitorUseCase } from "./application/use-cases/monitors/update-monitor.usecase";
import { DeleteMonitorUseCase } from "./application/use-cases/monitors/delete-monitor.usecase";
import { ExecuteCheckUseCase } from "./application/use-cases/monitoring/execute-check.usecase";
import { GetHistoryUseCase } from "./application/use-cases/stats/get-history.usecase";
import { GetGroupsUseCase } from "./application/use-cases/stats/get-groups.usecase";
import { GetGroupOverviewUseCase } from "./application/use-cases/stats/get-group-overview.usecase";

// Use cases de Viewers y Backup
import { ListViewersUseCase } from "./application/use-cases/users/list-viewers.usecase";
import { CreateViewerUseCase } from "./application/use-cases/users/create-viewer.usecase";
import { UpdateViewerPermissionsUseCase } from "./application/use-cases/users/update-viewer-permissions.usecase";
import { DeleteViewerUseCase } from "./application/use-cases/users/delete-viewer.usecase";
import { ExportBackupUseCase } from "./application/use-cases/backup/export-backup.usecase";
import { ImportBackupUseCase } from "./application/use-cases/backup/import-backup.usecase";

// Use cases de Notificaciones
import { CreateNotificationUseCase } from "./application/use-cases/notifications/create-notification.usecase";
import { ListNotificationsUseCase } from "./application/use-cases/notifications/list-notifications.usecase";
import { UpdateNotificationUseCase } from "./application/use-cases/notifications/update-notification.usecase";
import { DeleteNotificationUseCase } from "./application/use-cases/notifications/delete-notification.usecase";
import { TestNotificationUseCase } from "./application/use-cases/notifications/test-notification.usecase";

// HTTP
import { AuthController } from "./infrastructure/http/controllers/auth.controller";
import { MonitorController } from "./infrastructure/http/controllers/monitor.controller";
import { StatsController } from "./infrastructure/http/controllers/stats.controller";
import { UserController } from "./infrastructure/http/controllers/user.controller";
import { BackupController } from "./infrastructure/http/controllers/backup.controller";
import { NotificationController } from "./infrastructure/http/controllers/notification.controller";

import { authRoutes } from "./infrastructure/http/routes/auth.routes";
import { monitorRoutes } from "./infrastructure/http/routes/monitor.routes";
import { statsRoutes } from "./infrastructure/http/routes/stats.routes";
import { userRoutes } from "./infrastructure/http/routes/user.routes";
import { backupRoutes } from "./infrastructure/http/routes/backup.routes";
import { notificationRoutes } from "./infrastructure/http/routes/notification.routes";

import { makeAuthGuard } from "./infrastructure/http/middlewares/auth-guard";
import { errorHandler } from "./infrastructure/http/middlewares/error-handler";
import { MonitorModel } from "./infrastructure/persistence/mongoose/schemas/monitor.schema";
import { MonitorStatus } from "./domain/value-objects/monitor-status";

export interface AppContainer {
  server: http.Server;
  scheduler: IScheduler;
}

/**
 * Composition root: instancia y cablea todas las dependencias (DI manual).
 * El orden respeta la regla: io necesita el server; el resto se construye después
 * y las rutas se montan sobre el app ya creado.
 */
export function buildContainer(env: Env): AppContainer {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.corsOrigin } });

  // Seguridad
  const tokens = new JwtTokenService(env.jwtSecret, env.jwtExpiresInSeconds);
  const hasher = new BcryptPasswordHasher();

  // Repositorios
  const users = new MongooseUserRepository();
  const monitors = new MongooseMonitorRepository();
  const heartbeats = new MongooseHeartbeatRepository();
  const notifications = new MongooseNotificationRepository();

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
  const createMonitor = new CreateMonitorUseCase(monitors, scheduler);
  const listMonitors = new ListMonitorsUseCase(monitors, heartbeats);
  const updateMonitor = new UpdateMonitorUseCase(monitors, scheduler);
  const deleteMonitor = new DeleteMonitorUseCase(monitors, heartbeats, scheduler);
  const getHistory = new GetHistoryUseCase(monitors, heartbeats);
  const getGroups = new GetGroupsUseCase(monitors);
  const getGroupOverview = new GetGroupOverviewUseCase(monitors, heartbeats);

  // Instanciación de Use cases de Viewers y Backup
  const listViewers = new ListViewersUseCase(users);
  const createViewer = new CreateViewerUseCase(users, hasher);
  const updateViewerPermissions = new UpdateViewerPermissionsUseCase(users);
  const deleteViewer = new DeleteViewerUseCase(users);
  const exportBackup = new ExportBackupUseCase(monitors);
  const importBackup = new ImportBackupUseCase(monitors, scheduler);

  // Instanciación de Use cases de Notificaciones
  const listNotifications = new ListNotificationsUseCase(notifications);
  const createNotification = new CreateNotificationUseCase(notifications);
  const updateNotification = new UpdateNotificationUseCase(notifications);
  const deleteNotification = new DeleteNotificationUseCase(notifications, monitors, scheduler);
  const testNotification = new TestNotificationUseCase(notifications, notifier);

  // Controllers
  const authController = new AuthController(register, login);
  const monitorController = new MonitorController(
    createMonitor,
    listMonitors,
    updateMonitor,
    deleteMonitor,
  );
  const statsController = new StatsController(getHistory, getGroups, getGroupOverview, monitors);
  const userController = new UserController(
    listViewers,
    createViewer,
    updateViewerPermissions,
    deleteViewer,
    users,
    hasher,
  );
  const backupController = new BackupController(exportBackup, importBackup);
  const notificationController = new NotificationController(
    listNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    testNotification,
  );

  // Rutas
  const authGuard = makeAuthGuard(tokens);
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/metrics", async (req, res) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"] || req.query.apiKey;

    let authorized = false;

    // Verificar API Key si está configurada en env
    const configuredApiKey = process.env.AZKIN_PROMETHEUS_API_KEY;
    if (configuredApiKey) {
      // Si hay una API Key configurada, la autenticación básica se deshabilita
      if (apiKeyHeader === configuredApiKey) {
        authorized = true;
      }
    } else {
      // De forma predeterminada, solo se usa autenticación básica (Basic Auth)
      const configuredUser = process.env.AZKIN_PROMETHEUS_USER || "prom_scraper";
      const configuredPass = process.env.AZKIN_PROMETHEUS_PASS || "PrometheusScraperSecurePass123!";

      if (authHeader && authHeader.startsWith("Basic ")) {
        const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString("ascii").split(":");
        const user = credentials[0];
        const pass = credentials[1];
        if (user === configuredUser && pass === configuredPass) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Azkin Metrics"');
      return res.status(401).send("Unauthorized");
    }

    try {
      const monitorsList = await MonitorModel.find({}).lean();
      const ids = monitorsList.map((m: any) => m._id.toString());
      const summaries = await heartbeats.getSummaries(ids);

      const total = monitorsList.length;
      const up = monitorsList.filter((m: any) => m.isActive && summaries[m._id.toString()]?.lastStatus === MonitorStatus.UP).length;
      const down = monitorsList.filter((m: any) => m.isActive && summaries[m._id.toString()]?.lastStatus === MonitorStatus.DOWN).length;
      const pending = monitorsList.filter((m: any) => m.isActive && (summaries[m._id.toString()]?.lastStatus === MonitorStatus.PENDING || !summaries[m._id.toString()])).length;
      const paused = monitorsList.filter((m: any) => !m.isActive).length;

      let responseText = "";
      responseText += `# HELP azkin_monitors_total Total number of monitors\n`;
      responseText += `# TYPE azkin_monitors_total gauge\n`;
      responseText += `azkin_monitors_total ${total}\n\n`;

      responseText += `# HELP azkin_monitors_active Total active monitors being checked\n`;
      responseText += `# TYPE azkin_monitors_active gauge\n`;
      responseText += `azkin_monitors_active ${monitorsList.filter((m: any) => m.isActive).length}\n\n`;

      responseText += `# HELP azkin_monitors_up Active monitors in UP status\n`;
      responseText += `# TYPE azkin_monitors_up gauge\n`;
      responseText += `azkin_monitors_up ${up}\n\n`;

      responseText += `# HELP azkin_monitors_down Active monitors in DOWN status\n`;
      responseText += `# TYPE azkin_monitors_down gauge\n`;
      responseText += `azkin_monitors_down ${down}\n\n`;

      responseText += `# HELP azkin_monitors_pending Active monitors in PENDING status\n`;
      responseText += `# TYPE azkin_monitors_pending gauge\n`;
      responseText += `azkin_monitors_pending ${pending}\n\n`;

      responseText += `# HELP azkin_monitors_paused Paused monitors\n`;
      responseText += `# TYPE azkin_monitors_paused gauge\n`;
      responseText += `azkin_monitors_paused ${paused}\n\n`;

      responseText += `# HELP azkin_monitor_status Individual monitor status (1 = UP, 0 = DOWN/PENDING/PAUSED)\n`;
      responseText += `# TYPE azkin_monitor_status gauge\n`;
      for (const m of monitorsList) {
        const name = m.name.replace(/"/g, '\\"');
        const summary = summaries[m._id.toString()];
        const statusVal = m.isActive && summary && summary.lastStatus === MonitorStatus.UP ? 1 : 0;
        responseText += `azkin_monitor_status{id="${m._id}",name="${name}",type="${m.type}",group="${m.group || ""}"} ${statusVal}\n`;
      }
      responseText += `\n`;

      responseText += `# HELP azkin_monitor_latency_ms Individual monitor last ping latency in milliseconds\n`;
      responseText += `# TYPE azkin_monitor_latency_ms gauge\n`;
      for (const m of monitorsList) {
        const summary = summaries[m._id.toString()];
        if (m.isActive && summary && summary.lastPing !== null && summary.lastPing !== undefined) {
          const name = m.name.replace(/"/g, '\\"');
          responseText += `azkin_monitor_latency_ms{id="${m._id}",name="${name}",type="${m.type}",group="${m.group || ""}"} ${summary.lastPing}\n`;
        }
      }

      res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
      return res.status(200).send(responseText);
    } catch (err: any) {
      return res.status(500).send(`# ERROR: ${err.message}`);
    }
  });

  app.use("/api/v1/auth", authRoutes(authController));
  app.use("/api/v1/monitors", authGuard, monitorRoutes(monitorController));
  app.use("/api/v1/stats", authGuard, statsRoutes(statsController));
  app.use("/api/v1/users", authGuard, userRoutes(userController));
  app.use("/api/v1/backup", authGuard, backupRoutes(backupController));
  app.use("/api/v1/notifications", authGuard, notificationRoutes(notificationController));
  app.use(errorHandler);

  return { server, scheduler };
}


