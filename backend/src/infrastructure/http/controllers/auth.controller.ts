// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { RegisterUseCase } from "../../../application/use-cases/auth/register.usecase";
import { LoginUseCase } from "../../../application/use-cases/auth/login.usecase";
import { RequestPasswordResetUseCase } from "../../../application/use-cases/auth/request-password-reset.usecase";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/reset-password.usecase";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly users: IUserRepository,
    private readonly appUrl?: string,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUseCase.execute(req.body);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    res.status(200).json(result);
  };

  // AZ-002: el frontend consulta este endpoint público para decidir si mostrar el CTA de registro.
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
