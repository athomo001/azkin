import { env } from "./infrastructure/config/env";
import { buildContainer } from "./composition-root";
import { connectMongo, disconnectMongo } from "./infrastructure/persistence/mongoose/connection";
import { logger } from "./infrastructure/logger";

async function bootstrap(): Promise<void> {
  await connectMongo(env.mongoUri);
  logger.info("Connected to MongoDB");

  const { server, scheduler } = buildContainer(env);
  await scheduler.start();

  server.listen(env.port, () => {
    logger.info(`Azkin backend listening on port ${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    scheduler.stopAll();
    server.close();
    await disconnectMongo();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  logger.error("Fatal error during bootstrap", error);
  process.exit(1);
});
