// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ApplyTlsConfigUseCase } from "../../../application/use-cases/system/apply-tls-config.usecase";
import { GetTlsConfigUseCase } from "../../../application/use-cases/system/get-tls-config.usecase";

export class SystemController {
  constructor(
    private readonly applyTlsConfigUseCase: ApplyTlsConfigUseCase,
    private readonly getTlsConfigUseCase: GetTlsConfigUseCase,
  ) {}

  getTlsConfig = async (_req: Request, res: Response): Promise<void> => {
    const status = await this.getTlsConfigUseCase.execute();
    res.status(200).json(status);
  };

  applyTlsConfig = async (req: Request, res: Response): Promise<void> => {
    const actorId = req.adminId!;
    const result = await this.applyTlsConfigUseCase.execute({
      actorId,
      certPem: req.body.certPem,
      keyPem: req.body.keyPem,
      chainPem: req.body.chainPem,
      port: req.body.port,
      httpRedirect: req.body.httpRedirect,
    });
    res.status(200).json({
      port: result.config.port,
      httpRedirect: result.config.httpRedirect,
      updatedAt: result.config.updatedAt,
    });
  };
}
