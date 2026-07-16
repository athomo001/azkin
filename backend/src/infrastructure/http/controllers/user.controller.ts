import { Request, Response } from "express";
import { CreateViewerUseCase } from "../../../application/use-cases/users/create-viewer.usecase";
import { ListViewersUseCase } from "../../../application/use-cases/users/list-viewers.usecase";
import { UpdateViewerPermissionsUseCase } from "../../../application/use-cases/users/update-viewer-permissions.usecase";
import { DeleteViewerUseCase } from "../../../application/use-cases/users/delete-viewer.usecase";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { IPasswordHasher } from "../../../application/ports/services/security";

export class UserController {
  constructor(
    private readonly listUseCase: ListViewersUseCase,
    private readonly createUseCase: CreateViewerUseCase,
    private readonly updateUseCase: UpdateViewerPermissionsUseCase,
    private readonly deleteUseCase: DeleteViewerUseCase,
    private readonly usersRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    // Solo admins pueden gestionar Viewers (validado por el router middleware)
    const adminId = req.userId!;
    const viewers = await this.listUseCase.execute(adminId);
    res.status(200).json(viewers.map(v => ({
      id: v.id,
      email: v.email,
      username: v.username,
      role: v.role,
      adminId: v.adminId,
      permissions: v.permissions,
      isTvSessionEnabled: v.isTvSessionEnabled ?? false,
      preferences: v.preferences,
    })));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.userId!;
    const viewer = await this.createUseCase.execute({
      adminId,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      permissions: req.body.permissions,
      isTvSessionEnabled: req.body.isTvSessionEnabled,
    });
    res.status(201).json({
      id: viewer.id,
      email: viewer.email,
      username: viewer.username,
      role: viewer.role,
      adminId: viewer.adminId,
      permissions: viewer.permissions,
      isTvSessionEnabled: viewer.isTvSessionEnabled ?? false,
      preferences: viewer.preferences,
    });
  };

  updatePermissions = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.userId!;
    const id = req.params.id as string;
    const viewer = await this.updateUseCase.execute({
      adminId,
      id,
      permissions: req.body.permissions,
      isTvSessionEnabled: req.body.isTvSessionEnabled,
    });
    res.status(200).json({
      id: viewer.id,
      email: viewer.email,
      username: viewer.username,
      role: viewer.role,
      adminId: viewer.adminId,
      permissions: viewer.permissions,
      isTvSessionEnabled: viewer.isTvSessionEnabled ?? false,
      preferences: viewer.preferences,
    });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.userId!;
    const id = req.params.id as string;
    await this.deleteUseCase.execute(adminId, id);
    res.status(204).send();
  };

  changeOwnPassword = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }
    const passwordHash = await this.hasher.hash(newPassword);
    const success = await this.usersRepo.changePassword(userId, passwordHash);
    if (!success) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  };

  changeViewerPassword = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.userId!;
    const viewerId = req.params.id as string;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    // Verificar que el viewer pertenece a este admin
    const viewer = await this.usersRepo.findViewerById(adminId, viewerId);
    if (!viewer) {
      res.status(404).json({ error: "Viewer no encontrado o no autorizado" });
      return;
    }

    const passwordHash = await this.hasher.hash(newPassword);
    await this.usersRepo.changePassword(viewerId, passwordHash);
    res.status(200).json({ message: "Contraseña del Viewer actualizada" });
  };

  /**
   * Actualiza las preferencias visuales del usuario autenticado (ej. NyanCat mode).
   */
  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { nyanCatMode } = req.body;

    if (typeof nyanCatMode !== 'boolean') {
      res.status(400).json({ error: "nyanCatMode debe ser booleano" });
      return;
    }

    // Actualizar directamente en el repositorio
    await this.usersRepo.updatePreferences(userId, { nyanCatMode });
    res.status(200).json({ success: true, preferences: { nyanCatMode } });
  };
}
