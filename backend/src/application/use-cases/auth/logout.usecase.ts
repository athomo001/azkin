/**
 * Caso de uso para cerrar la sesión del usuario.
 * Para una implementación JWT sin estado, la invalidación física ocurre eliminando el token de refresco del cliente
 * en la capa HTTP (remoción de la cookie refreshToken).
 */
export class LogoutUseCase {
  async execute(): Promise<void> {
    // Operación lógica de cierre de sesión
  }
}
