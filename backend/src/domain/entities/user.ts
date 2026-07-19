// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type UserRole = "admin" | "viewer";

export interface IUserPermission {
  type: "all" | "group" | "monitor";
  value?: string; // Nombre del Monitor Group o ID del monitor individual autorizado
}

/**
 * Entidad pura que representa a un usuario dentro del dominio de Azkin.
 * Define la estructura y los roles de acceso (Admin y Viewer) con sus permisos correspondientes.
 */
export interface IUser {
  id: string;
  email?: string;
  username?: string;
  passwordHash: string; // Hash de contraseña para autenticación (seguridad, no expuesto al exterior)
  role: UserRole;
  adminId?: string; // ID del administrador propietario (requerido solo si el rol es "viewer")
  permissions: IUserPermission[]; // Listado de permisos de lectura asignados para el viewer
  isTvSessionEnabled?: boolean; // Habilita sesiones de visualización prolongadas (ej. 1 año) para TV
  resetPasswordTokenHash?: string | null; // hash SHA-256 del token de recuperación vigente (nunca el token en claro)
  resetPasswordExpiresAt?: Date | null; // expiración corta del token de recuperación
  isBlocked?: boolean; // AZ-023: cuenta bloqueada por otro admin; impide login/refresh
  preferences: {
    nyanCatMode: boolean; // Activa el easter egg de nyan cat en los gráficos
  };
  createdAt: Date;
  updatedAt: Date;
}
