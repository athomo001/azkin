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

// Services
import { JwtTokenService } from "./infrastructure/security/jwt-token-service";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";
import { SocketIoGateway } from "./infrastructure/realtime/socketio.gateway";
import { LogNotifier } from "./infrastructure/notifier/log-notifier";
import { CheckerRegistry } from "./infrastructure/checkers/registry";
import { HttpChecker } from "./infrastructure/checkers/http.checker";
import { PingChecker } from "./infrastructure/checkers/ping.checker";
import { PortChecker } from "./infrastructure/checkers/port.checker";
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
import { GetTagsUseCase } from "./application/use-cases/stats/get-tags.usecase";
import { GetTagOverviewUseCase } from "./application/use-cases/stats/get-tag-overview.usecase";

// HTTP
import { AuthController } from "./infrastructure/http/controllers/auth.controller";
import { MonitorController } from "./infrastructure/http/controllers/monitor.controller";
import { StatsController } from "./infrastructure/http/controllers/stats.controller";
import { authRoutes } from "./infrastructure/http/routes/auth.routes";
import { monitorRoutes } from "./infrastructure/http/routes/monitor.routes";
import { statsRoutes } from "./infrastructure/http/routes/stats.routes";
import { makeAuthGuard } from "./infrastructure/http/middlewares/auth-guard";
import { errorHandler } from "./infrastructure/http/middlewares/error-handler";

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

  // Tiempo real + alertas
  const publisher = new SocketIoGateway(io, tokens);
  const notifier = new LogNotifier();

  // Checkers + concurrencia
  const limit = pLimit(env.checkConcurrency);
  const registry = new CheckerRegistry(
    [new HttpChecker(), new PingChecker(), new PortChecker()],
    limit,
  );

  // Motor de monitoreo
  const executeCheck = new ExecuteCheckUseCase(registry, heartbeats, publisher, notifier);
  const scheduler = new InMemoryScheduler(monitors, executeCheck, env.firstCheckDelayMs);

  // Casos de uso
  const register = new RegisterUseCase(users, hasher, tokens);
  const login = new LoginUseCase(users, hasher, tokens);
  const createMonitor = new CreateMonitorUseCase(monitors, scheduler);
  const listMonitors = new ListMonitorsUseCase(monitors, heartbeats);
  const updateMonitor = new UpdateMonitorUseCase(monitors, scheduler);
  const deleteMonitor = new DeleteMonitorUseCase(monitors, heartbeats, scheduler);
  const getHistory = new GetHistoryUseCase(monitors, heartbeats);
  const getTags = new GetTagsUseCase(monitors);
  const getTagOverview = new GetTagOverviewUseCase(monitors, heartbeats);

  // Controllers
  const authController = new AuthController(register, login);
  const monitorController = new MonitorController(
    createMonitor,
    listMonitors,
    updateMonitor,
    deleteMonitor,
  );
  const statsController = new StatsController(getHistory, getTags, getTagOverview);

  // Rutas
  const authGuard = makeAuthGuard(tokens);
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/v1/auth", authRoutes(authController));
  app.use("/api/v1/monitors", authGuard, monitorRoutes(monitorController));
  app.use("/api/v1/stats", authGuard, statsRoutes(statsController));
  app.use(errorHandler);

  return { server, scheduler };
}
