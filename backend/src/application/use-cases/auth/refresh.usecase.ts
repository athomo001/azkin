// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { ITokenService } from "../../ports/services/security";
import { AccountBlockedError, UnauthorizedError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";
import { REFRESH_TOKEN_EXPIRES_IN_SECONDS } from "./login.usecase";

export interface RefreshInput {
  token: string; // Token de refresco recibido
}

/**
 * Caso de uso para renovar los tokens de acceso a partir de un refresh token válido.
 * Valida la expiración, firma y busca los datos más recientes del usuario.
 */
export class RefreshUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokens: ITokenService,
  ) {}

  async execute(input: RefreshInput): Promise<AuthOutput> {
    try {
      const decoded = this.tokens.verify(input.token);
      const user = await this.users.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError("Usuario inexistente o eliminado");
      }

      if (user.isBlocked) {
        throw new AccountBlockedError();
      }

      // Emite un nuevo access token con claims extendidos actualizados
      // Preserva la sesión larga (1 año) para cuentas TV/Kiosko en cada refresh
      const tvExpiresIn = user.isTvSessionEnabled ? 31536000 : undefined;
      const token = this.tokens.sign(user.id, user.role, user.adminId, user.permissions, tvExpiresIn);
      // Rotación del refresh token en cada uso (reduce la ventana de un token filtrado).
      const refreshToken = this.tokens.sign(
        user.id,
        user.role,
        user.adminId,
        user.permissions,
        tvExpiresIn ?? REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      );

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          adminId: user.adminId,
          permissions: user.permissions,
          isTvSessionEnabled: user.isTvSessionEnabled ?? false,
          preferences: {
            nyanCatMode: user.preferences?.nyanCatMode ?? false,
          },
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof AccountBlockedError) throw error;
      throw new UnauthorizedError("Falta token / inválido / expirado");
    }
  }
}
