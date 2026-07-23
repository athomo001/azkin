// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface CreateFederationEnrollmentTokenData {
  tokenHash: string;
  createdById: string;
  expiresAt: Date;
}

export interface ConsumedFederationEnrollmentToken {
  createdById: string;
}

/**
 * Puerto (interfaz) para tokens de enrollment de federación: de un solo uso, con expiración
 * corta. Mismo criterio que el token de recuperación de contraseña (hash SHA-256 persistido,
 * nunca el token en texto plano).
 */
export interface IFederationEnrollmentTokenRepository {
  create(data: CreateFederationEnrollmentTokenData): Promise<void>;
  /**
   * Consume el token de forma atómica: si el hash existe y no expiró, lo borra y devuelve sus
   * datos; si no, devuelve null. Borrar en la misma operación garantiza el uso único incluso
   * ante llamadas concurrentes con el mismo token.
   */
  consumeValid(tokenHash: string): Promise<ConsumedFederationEnrollmentToken | null>;
}
