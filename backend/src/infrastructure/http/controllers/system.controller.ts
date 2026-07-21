// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ApplyTlsConfigUseCase } from "../../../application/use-cases/system/apply-tls-config.usecase";
import { GetTlsConfigUseCase } from "../../../application/use-cases/system/get-tls-config.usecase";
import { GetSmtpStatusUseCase } from "../../../application/use-cases/system/get-smtp-status.usecase";
import { SendTestEmailUseCase } from "../../../application/use-cases/system/send-test-email.usecase";
import { GetAppSmtpChannelUseCase } from "../../../application/use-cases/system/get-app-smtp-channel.usecase";
import { SetAppSmtpChannelUseCase } from "../../../application/use-cases/system/set-app-smtp-channel.usecase";
import { GetMonitoringEngineSettingsUseCase } from "../../../application/use-cases/system/get-monitoring-engine-settings.usecase";
import { SetMonitoringEngineSettingsUseCase } from "../../../application/use-cases/system/set-monitoring-engine-settings.usecase";
import { ISmtpConfigResolver } from "../../../application/ports/services/smtp-config-resolver";
import { ValidationError } from "../../../domain/errors/domain-error";

export class SystemController {
  constructor(
    private readonly applyTlsConfigUseCase: ApplyTlsConfigUseCase,
    private readonly getTlsConfigUseCase: GetTlsConfigUseCase,
    private readonly getSmtpStatusUseCase: GetSmtpStatusUseCase,
    private readonly sendTestEmailUseCase: SendTestEmailUseCase,
    private readonly smtpConfigResolver: ISmtpConfigResolver,
    private readonly getAppSmtpChannelUseCase: GetAppSmtpChannelUseCase,
    private readonly setAppSmtpChannelUseCase: SetAppSmtpChannelUseCase,
    private readonly getMonitoringEngineSettingsUseCase: GetMonitoringEngineSettingsUseCase,
    private readonly setMonitoringEngineSettingsUseCase: SetMonitoringEngineSettingsUseCase,
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
    const resolved = await this.smtpConfigResolver.resolve();
    const status = this.getSmtpStatusUseCase.execute({
      host: resolved.host,
      port: resolved.port ?? 587,
      secure: resolved.secure ?? false,
      user: resolved.user,
    });
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

  /**
   * Devuelve qué canal de notificación (si alguno) está siendo reutilizado como SMTP de
   * aplicación en vez de `AZKIN_SMTP_*`.
   */
  getAppSmtpChannel = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.getAppSmtpChannelUseCase.execute();
    res.status(200).json(result);
  };

  /**
   * Elige (o quita, con `null`) el canal de notificación de tipo email a reutilizar como SMTP
   * de aplicación.
   */
  setAppSmtpChannel = async (req: Request, res: Response): Promise<void> => {
    const actorId = req.adminId!;
    const notificationChannelId = req.body.notificationChannelId ?? null;
    await this.setAppSmtpChannelUseCase.execute(actorId, notificationChannelId);
    res.status(200).json({ message: "SMTP de aplicación actualizado." });
  };

  /**
   * Devuelve los overrides vigentes de latencia de degradación / intervalo acelerado, junto con
   * los valores de `.env` que aplican si no hay override (para mostrarlos en la UI).
   */
  getMonitoringEngineSettings = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.getMonitoringEngineSettingsUseCase.execute();
    res.status(200).json(result);
  };

  /**
   * Fija (o restablece, con `null`) los overrides de latencia de degradación / intervalo
   * acelerado del motor de monitoreo.
   */
  setMonitoringEngineSettings = async (req: Request, res: Response): Promise<void> => {
    const actorId = req.adminId!;
    await this.setMonitoringEngineSettingsUseCase.execute(actorId, {
      degradedLatencyMs: req.body.degradedLatencyMs,
      acceleratedIntervalSeconds: req.body.acceleratedIntervalSeconds,
    });
    res.status(200).json({ message: "Configuración del motor de monitoreo actualizada." });
  };
}
