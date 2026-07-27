// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserPermission } from "../../../domain/entities/user";

/** Distingue un token de acceso (corta vida, autoriza requests normales) de uno de refresco
 * (larga vida, solo sirve para pedir un access token nuevo) — evita que uno se use en lugar del
 * otro si se filtra (AZ-054). */
export type TokenType = "access" | "refresh";

export interface ITokenService {
  sign(
    userId: string,
    role: string,
    type: TokenType,
    adminId?: string,
    permissions?: IUserPermission[],
    expiresInSecondsOverride?: number,
  ): string;
  /** Si se pasa `expectedType`, rechaza el token cuando su claim `typ` no coincide. */
  verify(
    token: string,
    expectedType?: TokenType,
  ): { userId: string; role: string; adminId?: string; permissions?: IUserPermission[] };
}

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
