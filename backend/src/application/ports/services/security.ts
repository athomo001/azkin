// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface ITokenService {
  sign(userId: string, role: string, adminId?: string, permissions?: any[]): string;
  verify(token: string): { userId: string; role: string; adminId?: string; permissions?: any[] };
}

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
