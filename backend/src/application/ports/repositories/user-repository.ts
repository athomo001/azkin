import { IUser } from "../../../domain/entities/user";

export interface CreateUserData {
  email: string;
  passwordHash: string;
}

export interface CreateViewerData {
  email?: string;
  username?: string;
  passwordHash: string;
  role: "viewer";
  adminId: string; // ID del administrador propietario
  permissions: IUser["permissions"];
  isTvSessionEnabled?: boolean;
}

export interface UpdateViewerPermissionsData {
  permissions: IUser["permissions"];
  isTvSessionEnabled?: boolean;
}

/**
 * Puerto (interfaz) para el repositorio que gestionará la persistencia de usuarios (User).
 * Define métodos de registro, inicio de sesión y administración de Viewers vinculados.
 */
export interface IUserRepository {
  create(data: CreateUserData): Promise<IUser>;
  /** Debe incluir el passwordHash para procesos de login. */
  findByEmail(email: string): Promise<IUser | null>;
  findByIdentifier(identifier: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  changePassword(id: string, newPasswordHash: string): Promise<boolean>;
  
  // Administración de Viewers por parte de un Admin
  createViewer(data: CreateViewerData): Promise<IUser>;
  findAllViewers(adminId: string): Promise<IUser[]>;
  findViewerById(adminId: string, id: string): Promise<IUser | null>;
  updateViewerPermissions(adminId: string, id: string, data: UpdateViewerPermissionsData): Promise<IUser | null>;
  deleteViewer(adminId: string, id: string): Promise<boolean>;
  updatePreferences(userId: string, prefs: { nyanCatMode: boolean }): Promise<void>;
}
