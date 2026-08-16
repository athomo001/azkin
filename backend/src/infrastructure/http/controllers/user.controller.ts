// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateViewerUseCase } from "../../../application/use-cases/users/create-viewer.usecase";
import { ListViewersUseCase } from "../../../application/use-cases/users/list-viewers.usecase";
import { UpdateViewerPermissionsUseCase } from "../../../application/use-cases/users/update-viewer-permissions.usecase";
import { DeleteViewerUseCase } from "../../../application/use-cases/users/delete-viewer.usecase";
import { CreateAdminUseCase } from "../../../application/use-cases/users/create-admin.usecase";
import { ListAdminsUseCase } from "../../../application/use-cases/users/list-admins.usecase";
import { UpdateAdminUseCase } from "../../../application/use-cases/users/update-admin.usecase";
import { SetAdminBlockedUseCase } from "../../../application/use-cases/users/set-admin-blocked.usecase";
import { DeleteAdminUseCase } from "../../../application/use-cases/users/delete-admin.usecase";
import { ListThemeModesUseCase } from "../../../application/use-cases/theme-modes/list-theme-modes.usecase";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { IPasswordHasher } from "../../../application/ports/services/security";
import { IAuditLogRepository } from "../../../application/ports/repositories/audit-log-repository";
import { isPasswordStrong, PASSWORD_POLICY_MESSAGE } from "../../../application/services/password-policy";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../../domain/errors/domain-error";

export class UserController {
  constructor(
    private readonly listUseCase: ListViewersUseCase,
    private readonly createUseCase: CreateViewerUseCase,
    private readonly updateUseCase: UpdateViewerPermissionsUseCase,
    private readonly deleteUseCase: DeleteViewerUseCase,
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly listAdminsUseCase: ListAdminsUseCase,
    private readonly updateAdminUseCase: UpdateAdminUseCase,
    private readonly setAdminBlockedUseCase: SetAdminBlockedUseCase,
    private readonly deleteAdminUseCase: DeleteAdminUseCase,
    private readonly usersRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly auditLog: IAuditLogRepository,
    private readonly listThemeModes: ListThemeModesUseCase,
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

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    const admin = await this.createAdminUseCase.execute({
      actorId: req.userId!,
      email: req.body.email,
      password: req.body.password,
    });
    res.status(201).json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
  };

  listAdmins = async (_req: Request, res: Response): Promise<void> => {
    const admins = await this.listAdminsUseCase.execute();
    res.status(200).json(admins.map((a) => ({
      id: a.id,
      email: a.email,
      role: a.role,
      createdAt: a.createdAt,
      isBlocked: a.isBlocked ?? false,
    })));
  };

  updateAdmin = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const admin = await this.updateAdminUseCase.execute({ actorId: req.userId!, id, email: req.body.email });
    res.status(200).json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      isBlocked: admin.isBlocked ?? false,
    });
  };

  resetAdminPassword = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { newPassword } = req.body;
    if (!isPasswordStrong(newPassword)) {
      throw new ValidationError(PASSWORD_POLICY_MESSAGE);
    }
    // AZ-053: sin este chequeo, este endpoint (pensado solo para resetear la contraseña de OTRO
    // ADMIN) aceptaba igual el id de un Viewer — incluso de un Admin distinto — porque
    // `changePassword` no filtra por rol. Se verifica explícitamente que el id objetivo sea un
    // Admin antes de tocar su contraseña.
    const target = await this.usersRepo.findById(id);
    if (!target || target.role !== "admin") {
      throw new NotFoundError("Administrador no encontrado");
    }
    const passwordHash = await this.hasher.hash(newPassword);
    const success = await this.usersRepo.changePassword(id, passwordHash);
    if (!success) {
      throw new NotFoundError("Administrador no encontrado");
    }
    await this.auditLog.record({
      actorId: req.userId!,
      action: "ADMIN_PASSWORD_RESET",
      targetType: "user",
      targetIds: [id],
    });
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  };

  setAdminBlocked = async (req: Request, res: Response): Promise<void> => {
    const actorId = req.userId!;
    const id = req.params.id as string;
    const admin = await this.setAdminBlockedUseCase.execute(actorId, id, req.body.isBlocked);
    res.status(200).json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      isBlocked: admin.isBlocked ?? false,
    });
  };

  deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    const actorId = req.userId!;
    const id = req.params.id as string;
    await this.deleteAdminUseCase.execute(actorId, id);
    res.status(204).send();
  };

  changeOwnPassword = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;
    if (!isPasswordStrong(newPassword)) {
      throw new ValidationError(PASSWORD_POLICY_MESSAGE);
    }
    // AZ-057: exigir la contraseña actual antes de aplicar el cambio — sin esto, un token de
    // acceso expuesto brevemente (XSS, log filtrado, sesión abierta en un equipo compartido)
    // alcanzaba para tomar control permanente de la cuenta sin haber conocido nunca la
    // contraseña original.
    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      throw new ValidationError("Debes indicar tu contraseña actual");
    }
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    const matches = await this.hasher.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedError("La contraseña actual no es correcta");
    }
    const passwordHash = await this.hasher.hash(newPassword);
    await this.usersRepo.changePassword(userId, passwordHash);
    await this.auditLog.record({
      actorId: userId,
      action: "OWN_PASSWORD_CHANGE",
      targetType: "user",
      targetIds: [userId],
    });
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  };

  changeViewerPassword = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.userId!;
    const viewerId = req.params.id as string;
    const { newPassword } = req.body;
    if (!isPasswordStrong(newPassword)) {
      throw new ValidationError(PASSWORD_POLICY_MESSAGE);
    }

    // Verificar que el viewer pertenece a este admin
    const viewer = await this.usersRepo.findViewerById(adminId, viewerId);
    if (!viewer) {
      throw new NotFoundError("Viewer no encontrado o no autorizado");
    }

    const passwordHash = await this.hasher.hash(newPassword);
    await this.usersRepo.changePassword(viewerId, passwordHash);
    await this.auditLog.record({
      actorId: adminId,
      action: "VIEWER_PASSWORD_RESET",
      targetType: "user",
      targetIds: [viewerId],
    });
    res.status(200).json({ message: "Contraseña del Viewer actualizada" });
  };

  /**
   * Actualiza las preferencias visuales del usuario autenticado (Modo Temático activo, ver
   * spec/07-modos-tematicos.md §6.4).
   */
  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { themeMode } = req.body;

    if (themeMode !== null && typeof themeMode !== 'string') {
      throw new ValidationError("themeMode debe ser un string o null");
    }

    if (themeMode !== null) {
      const modes = await this.listThemeModes.execute();
      const isValid = modes.some((m) => m.id === themeMode && m.enabled);
      if (!isValid) {
        throw new ValidationError("themeMode inválido");
      }
    }

    // Actualizar directamente en el repositorio
    await this.usersRepo.updatePreferences(userId, { themeMode });
    res.status(200).json({ success: true, preferences: { themeMode } });
  };
}
