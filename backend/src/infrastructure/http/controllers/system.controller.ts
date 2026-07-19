// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ApplyTlsConfigUseCase } from "../../../application/use-cases/system/apply-tls-config.usecase";
import { GetTlsConfigUseCase } from "../../../application/use-cases/system/get-tls-config.usecase";
import { GetSmtpStatusUseCase, SmtpStatusInput } from "../../../application/use-cases/system/get-smtp-status.usecase";
import { SendTestEmailUseCase } from "../../../application/use-cases/system/send-test-email.usecase";
import { ValidationError } from "../../../domain/errors/domain-error";

export class SystemController {
  constructor(
    private readonly applyTlsConfigUseCase: ApplyTlsConfigUseCase,
    private readonly getTlsConfigUseCase: GetTlsConfigUseCase,
    private readonly getSmtpStatusUseCase: GetSmtpStatusUseCase,
    private readonly sendTestEmailUseCase: SendTestEmailUseCase,
    private readonly smtpConfig: SmtpStatusInput,
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

  getSmtpStatus = async (_req: Request, res: Response): Promise<void> => {
    const status = this.getSmtpStatusUseCase.execute(this.smtpConfig);
    res.status(200).json(status);
  };

  sendTestEmail = async (req: Request, res: Response): Promise<void> => {
    const recipient = req.body.recipient;
    if (typeof recipient !== "string" || !recipient.includes("@")) {
      throw new ValidationError("Se requiere un correo destinatario válido");
    }
    await this.sendTestEmailUseCase.execute(recipient);
    res.status(200).json({ message: "Correo de prueba enviado exitosamente." });
  };
}
