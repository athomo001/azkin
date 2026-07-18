// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { env } from "./infrastructure/config/env";
import { buildContainer } from "./composition-root";
import { connectMongo, disconnectMongo } from "./infrastructure/persistence/mongoose/connection";
import { logger } from "./infrastructure/logger";
import { seedFirstAdmin } from "./infrastructure/config/seed-first-admin";
import { MongooseUserRepository } from "./infrastructure/persistence/mongoose/repositories/mongoose-user.repository";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";
import { decryptPrivateKey } from "./infrastructure/security/tls-key-cipher";

async function bootstrap(): Promise<void> {
  await connectMongo(env.mongoUri);
  logger.info("Connected to MongoDB");

  // Ejecutar el seeder del primer admin antes de arrancar el contenedor de DI
  await seedFirstAdmin(new MongooseUserRepository(), new BcryptPasswordHasher(), env);

  const { server, scheduler, tlsServerManager, tlsConfigs, tlsEncryptionKey } = buildContainer(env);
  await scheduler.start();

  server.listen(env.port, () => {
    logger.info(`Azkin backend listening on port ${env.port}`);
  });

  // AZ-006: si ya existe una configuración TLS persistida, levantar el listener HTTPS al arrancar.
  const tlsConfig = await tlsConfigs.getActive();
  if (tlsConfig) {
    if (!tlsEncryptionKey) {
      logger.error(
        "Existe una configuración TLS guardada pero falta AZKIN_TLS_ENCRYPTION_KEY: no se levantará HTTPS.",
      );
    } else {
      try {
        const keyPem = decryptPrivateKey(tlsConfig.keyPemEncrypted, tlsEncryptionKey);
        await tlsServerManager.reload({
          certPem: tlsConfig.certPem,
          keyPem,
          chainPem: tlsConfig.chainPem,
          port: tlsConfig.port,
          httpRedirect: tlsConfig.httpRedirect,
        });
        logger.info(`Azkin backend listening on HTTPS port ${tlsConfig.port}`);
      } catch (error) {
        logger.error("No se pudo levantar el listener HTTPS con la configuración TLS persistida", error);
      }
    }
  }

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    scheduler.stopAll();
    server.close();
    tlsServerManager.stop();
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
