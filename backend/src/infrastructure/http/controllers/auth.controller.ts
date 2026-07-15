import { Request, Response } from "express";
import { RegisterUseCase } from "../../../application/use-cases/auth/register.usecase";
import { LoginUseCase } from "../../../application/use-cases/auth/login.usecase";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUseCase.execute(req.body);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    res.status(200).json(result);
  };
}
