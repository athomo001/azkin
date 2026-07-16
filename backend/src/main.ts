import { env } from "./infrastructure/config/env";
import { buildContainer } from "./composition-root";
import { connectMongo, disconnectMongo } from "./infrastructure/persistence/mongoose/connection";
import { logger } from "./infrastructure/logger";
import { seedFirstAdmin } from "./infrastructure/config/seed-first-admin";
import { MongooseUserRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-user.repository";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";

async function bootstrap(): Promise<void> {
  await connectMongo(env.mongoUri);
  logger.info("Connected to MongoDB");

  // Ejecutar el seeder del primer admin antes de arrancar el contenedor de DI
  await seedFirstAdmin(new MongooseUserRepository(), new BcryptPasswordHasher(), env);

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
