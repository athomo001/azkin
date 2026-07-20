// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../application/ports/repositories/user-repository";
import { IPasswordHasher } from "../../application/ports/services/security";
import { Env } from "./env";
import mongoose from "mongoose";
import { logger } from "../logger";

/**
 * Seeder del primer administrador.
 *
 * Al arrancar el backend, si AZKIN_FIRST_ADMIN_EMAIL está configurado en el .env
 * y no existe ningún usuario en la base de datos, crea el admin inicial de forma
 * automática sin necesidad de pasar por el endpoint público de registro.
 *
 * Si ya existen usuarios, el seeder omite la operación sin fallar (idempotente).
 * Si se crea un nuevo admin, adopta automáticamente todos los monitores huérfanos
 * (cuyos userId no pertenezcan a ningún usuario existente en la BD).
 */
export async function seedFirstAdmin(
  users: IUserRepository,
  hasher: IPasswordHasher,
  env: Env,
): Promise<void> {
  // Si las variables del seeder no están definidas, no hay nada que hacer
  if (!env.firstAdminEmail || !env.firstAdminPassword) return;

  // Comprobar si ya existe algún administrador en el sistema
  const existing = await users.findByEmail(env.firstAdminEmail);
  if (existing) {
    logger.info("[Seeder] El administrador inicial ya existe, seeder omitido.");
    return;
  }

  const passwordHash = await hasher.hash(env.firstAdminPassword);
  await users.create({
    email: env.firstAdminEmail,
    username: env.firstAdminName,
    passwordHash,
  });

  // Recuperar el admin recién creado para obtener su _id real
  const newAdmin = await users.findByEmail(env.firstAdminEmail);
  if (!newAdmin) return;

  // Adoptar monitores huérfanos: reasignar al nuevo admin todos los
  // monitores cuyo userId no corresponda a ningún usuario activo en la BD.
  const MonitorModel = mongoose.connection.collection("monitors");
  const UserModel = mongoose.connection.collection("users");

  // Obtener todos los userIds existentes en la colección de usuarios
  const allUserIds = await UserModel.distinct("_id");

  const result = await MonitorModel.updateMany(
    { userId: { $nin: allUserIds } },
    { $set: { userId: new mongoose.Types.ObjectId(newAdmin.id) } },
  );

  if (result.modifiedCount > 0) {
    logger.info(
      `[Seeder] ${result.modifiedCount} monitor(es) huérfano(s) reasignados al admin ${env.firstAdminEmail}`,
    );
  }

  logger.info(
    `[Seeder] Administrador inicial creado: ${env.firstAdminEmail}`,
  );
}
