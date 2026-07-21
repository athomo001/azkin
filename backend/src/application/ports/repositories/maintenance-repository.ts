// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceScope, IMaintenanceWindow, MaintenanceMode } from "../../../domain/entities/maintenance-window";

export interface CreateMaintenanceWindowData {
  createdBy: string;
  name: string;
  description?: string;
  scope: IMaintenanceScope[];
  mode: MaintenanceMode;
  startAt?: Date | null;
  endAt?: Date | null;
}

export interface UpdateMaintenanceWindowData {
  name?: string;
  description?: string;
  scope?: IMaintenanceScope[];
  startAt?: Date | null;
  endAt?: Date | null;
}

/**
 * Puerto (interfaz) para el repositorio de ventanas de mantenimiento.
 * Sin aislamiento por tenant entre Admins (mismo criterio que notificaciones/monitores):
 * todas las ventanas son un único pool global, visibles y editables por cualquier Admin.
 */
export interface IMaintenanceRepository {
  create(data: CreateMaintenanceWindowData): Promise<IMaintenanceWindow>;
  findAll(): Promise<IMaintenanceWindow[]>;
  /** Ventanas vigentes ahora mismo: inmediatas sin cerrar, o programadas dentro de su rango. */
  findActive(): Promise<IMaintenanceWindow[]>;
  findById(id: string): Promise<IMaintenanceWindow | null>;
  update(id: string, data: UpdateMaintenanceWindowData): Promise<IMaintenanceWindow | null>;
  /** Cierre manual: setea `closedAt` a la fecha actual. */
  close(id: string): Promise<IMaintenanceWindow | null>;
  delete(id: string): Promise<boolean>;
}
