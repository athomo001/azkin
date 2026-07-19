// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserPermission } from "../../../domain/entities/user";

export interface ITokenService {
  sign(userId: string, role: string, adminId?: string, permissions?: IUserPermission[], expiresInSecondsOverride?: number): string;
  verify(token: string): { userId: string; role: string; adminId?: string; permissions?: IUserPermission[] };
}

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
