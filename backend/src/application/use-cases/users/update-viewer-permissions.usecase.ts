// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IUser } from "../../../domain/entities/user";
import { NotFoundError } from "../../../domain/errors/domain-error";

export interface UpdateViewerPermissionsInput {
  adminId: string; // ID del administrador propietario
  id: string; // ID del viewer a modificar
  permissions: IUser["permissions"];
  isTvSessionEnabled?: boolean;
}

/**
 * Caso de uso para actualizar los privilegios granulares de lectura de un Viewer
 * así como su propiedad de sesión extendida para pantallas (TV).
 */
export class UpdateViewerPermissionsUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(input: UpdateViewerPermissionsInput): Promise<IUser> {
    const updated = await this.users.updateViewerPermissions(input.adminId, input.id, {
      permissions: input.permissions,
      isTvSessionEnabled: input.isTvSessionEnabled,
    });

    if (!updated) {
      throw new NotFoundError("Viewer no encontrado");
    }

    return updated;
  }
}
