// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Types } from "mongoose";

/**
 * Convierte el `_id` de un documento Mongoose a string para el dominio.
 * Reemplaza el `String(doc._id)` repetido en el `toDomain()` de cada repositorio.
 */
export function toDomainId(id: Types.ObjectId | string): string {
  return String(id);
}
