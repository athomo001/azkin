// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IApiKey, ApiKeyScope } from "../../../domain/entities/api-key";

export interface CreateApiKeyData {
  adminId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  scopes: ApiKeyScope[];
}

/**
 * Puerto (interfaz) para la persistencia de API Keys de la API pública.
 */
export interface IApiKeyRepository {
  create(data: CreateApiKeyData): Promise<IApiKey>;
  findByHash(keyHash: string): Promise<IApiKey | null>;
  findAllByAdmin(adminId: string): Promise<IApiKey[]>;
  /** Revoca una key; devuelve false si no existe o no pertenece al admin. */
  revoke(adminId: string, id: string): Promise<boolean>;
  /** Elimina la key permanentemente; devuelve false si no existe o no pertenece al admin. */
  delete(adminId: string, id: string): Promise<boolean>;
  touchLastUsed(id: string): Promise<void>;
  /** Elimina todas las API keys de todos los admins. Devuelve la cantidad eliminada ("Purgar instancia"). */
  deleteAll(): Promise<number>;
}
