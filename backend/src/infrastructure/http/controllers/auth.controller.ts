// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { RegisterUseCase } from "../../../application/use-cases/auth/register.usecase";
import { LoginUseCase } from "../../../application/use-cases/auth/login.usecase";
import { RefreshUseCase } from "../../../application/use-cases/auth/refresh.usecase";
import { RequestPasswordResetUseCase } from "../../../application/use-cases/auth/request-password-reset.usecase";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/reset-password.usecase";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { AuthOutput } from "../../../application/dtos/auth-output";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly users: IUserRepository,
    private readonly appUrl?: string,
  ) {}

  /** Persiste el refresh token como cookie HttpOnly y devuelve solo `{ token, user }` al cliente. */
  private respondWithSession(req: Request, res: Response, status: number, result: AuthOutput): void {
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
    res.status(status).json({ token: result.token, user: result.user });
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUseCase.execute(req.body);
    this.respondWithSession(req, res, 201, result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    this.respondWithSession(req, res, 200, result);
  };

  /**
   * Renueva la sesión a partir de la cookie HttpOnly de refresh.
   * Nunca lee el refresh token del body: solo la cookie, para que sea inaccesible a JS (XSS).
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedError("No hay sesión que renovar");
    }
    const result = await this.refreshUseCase.execute({ token: refreshToken });
    this.respondWithSession(req, res, 200, result);
  };

  /** Limpia la cookie de refresh. El access token en memoria del cliente se descarta localmente. */
  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/v1/auth" });
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  };

  // El frontend consulta este endpoint público para decidir si mostrar el CTA de registro.
  bootstrapStatus = async (_req: Request, res: Response): Promise<void> => {
    const adminCount = await this.users.countAdmins();
    res.status(200).json({ canRegister: adminCount === 0 });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    await this.requestPasswordResetUseCase.execute({ email: req.body.email, appUrl: this.appUrl });
    // Respuesta genérica: nunca revela si el correo existe (anti-enumeración).
    res.status(200).json({ message: "Si el correo existe, se enviaron instrucciones de recuperación." });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    await this.resetPasswordUseCase.execute({ token: req.body.token, newPassword: req.body.newPassword });
    res.status(200).json({ message: "Contraseña restablecida correctamente." });
  };
}
