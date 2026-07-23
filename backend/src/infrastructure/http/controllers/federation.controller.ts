// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateEnrollmentTokenUseCase } from "../../../application/use-cases/federation/create-enrollment-token.usecase";
import { JoinFederationUseCase } from "../../../application/use-cases/federation/join-federation.usecase";
import { AcceptEnrollmentUseCase } from "../../../application/use-cases/federation/accept-enrollment.usecase";
import { ListFederatedInstancesUseCase } from "../../../application/use-cases/federation/list-federated-instances.usecase";
import { RevokeFederatedInstanceUseCase } from "../../../application/use-cases/federation/revoke-federated-instance.usecase";
import { ListRemoteMonitorsUseCase } from "../../../application/use-cases/federation/list-remote-monitors.usecase";
import { CreateFederatedMonitorLinkUseCase } from "../../../application/use-cases/federation/create-federated-monitor-link.usecase";
import { ListFederatedMonitorLinksUseCase } from "../../../application/use-cases/federation/list-federated-monitor-links.usecase";
import { DeleteFederatedMonitorLinkUseCase } from "../../../application/use-cases/federation/delete-federated-monitor-link.usecase";
import { GetFederatedComparisonUseCase } from "../../../application/use-cases/federation/get-federated-comparison.usecase";
import { GetFederationPortUseCase } from "../../../application/use-cases/federation/get-federation-port.usecase";
import { ApplyFederationPortUseCase } from "../../../application/use-cases/federation/apply-federation-port.usecase";
import { TestEnrollmentConnectionUseCase } from "../../../application/use-cases/federation/test-enrollment-connection.usecase";
import { TestFederatedInstanceConnectionUseCase } from "../../../application/use-cases/federation/test-federated-instance-connection.usecase";
import { toFederatedInstanceResponse } from "../presenters/federation.presenter";
import { toFederatedMonitorLinkResponse } from "../presenters/federated-monitor-link.presenter";

export class FederationController {
  constructor(
    private readonly createEnrollmentTokenUseCase: CreateEnrollmentTokenUseCase,
    private readonly joinFederationUseCase: JoinFederationUseCase,
    private readonly acceptEnrollmentUseCase: AcceptEnrollmentUseCase,
    private readonly listFederatedInstancesUseCase: ListFederatedInstancesUseCase,
    private readonly revokeFederatedInstanceUseCase: RevokeFederatedInstanceUseCase,
    private readonly listRemoteMonitorsUseCase: ListRemoteMonitorsUseCase,
    private readonly createFederatedMonitorLinkUseCase: CreateFederatedMonitorLinkUseCase,
    private readonly listFederatedMonitorLinksUseCase: ListFederatedMonitorLinksUseCase,
    private readonly deleteFederatedMonitorLinkUseCase: DeleteFederatedMonitorLinkUseCase,
    private readonly getFederatedComparisonUseCase: GetFederatedComparisonUseCase,
    private readonly getFederationPortUseCase: GetFederationPortUseCase,
    private readonly applyFederationPortUseCase: ApplyFederationPortUseCase,
    private readonly testEnrollmentConnectionUseCase: TestEnrollmentConnectionUseCase,
    private readonly testFederatedInstanceConnectionUseCase: TestFederatedInstanceConnectionUseCase,
  ) {}

  createToken = async (req: Request, res: Response): Promise<void> => {
    const result = await this.createEnrollmentTokenUseCase.execute({
      actorId: req.userId!,
      ownUrl: req.body.ownUrl,
    });
    res.status(201).json({ code: result.code, expiresAt: result.expiresAt.toISOString() });
  };

  join = async (req: Request, res: Response): Promise<void> => {
    const { instance } = await this.joinFederationUseCase.execute({
      actorId: req.userId!,
      code: req.body.code,
      peerLabel: req.body.peerLabel,
      ownLabel: req.body.ownLabel,
      ownUrl: req.body.ownUrl,
    });
    res.status(201).json(toFederatedInstanceResponse(instance));
  };

  // Endpoint llamado por el backend de la instancia remota (sin sesión) — ver federation.routes.ts.
  accept = async (req: Request, res: Response): Promise<void> => {
    const result = await this.acceptEnrollmentUseCase.execute({
      token: req.body.token,
      callerCertPem: req.body.callerCertPem,
      callerLabel: req.body.callerLabel,
      callerUrl: req.body.callerUrl,
      callerFederationPort: req.body.callerFederationPort,
    });
    res.status(201).json(result);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const instances = await this.listFederatedInstancesUseCase.execute();
    res.status(200).json(instances.map(toFederatedInstanceResponse));
  };

  revoke = async (req: Request, res: Response): Promise<void> => {
    const instance = await this.revokeFederatedInstanceUseCase.execute(req.userId!, req.params.id as string);
    res.status(200).json(toFederatedInstanceResponse(instance));
  };

  remoteMonitors = async (req: Request, res: Response): Promise<void> => {
    const monitors = await this.listRemoteMonitorsUseCase.execute(req.params.id as string);
    res.status(200).json(monitors);
  };

  createLink = async (req: Request, res: Response): Promise<void> => {
    const link = await this.createFederatedMonitorLinkUseCase.execute({
      actorId: req.userId!,
      localMonitorId: req.body.localMonitorId,
      federatedInstanceId: req.body.federatedInstanceId,
      remoteMonitorId: req.body.remoteMonitorId,
      remoteMonitorLabel: req.body.remoteMonitorLabel,
    });
    res.status(201).json(toFederatedMonitorLinkResponse(link));
  };

  listLinks = async (req: Request, res: Response): Promise<void> => {
    const localMonitorId = typeof req.query.monitorId === "string" ? req.query.monitorId : undefined;
    const links = await this.listFederatedMonitorLinksUseCase.execute(localMonitorId);
    res.status(200).json(links.map(toFederatedMonitorLinkResponse));
  };

  deleteLink = async (req: Request, res: Response): Promise<void> => {
    await this.deleteFederatedMonitorLinkUseCase.execute(req.userId!, req.params.id as string);
    res.status(204).send();
  };

  comparison = async (req: Request, res: Response): Promise<void> => {
    const result = await this.getFederatedComparisonUseCase.execute(
      req.userRole!,
      req.permissions ?? [],
      req.params.monitorId as string,
    );
    res.status(200).json(result);
  };

  getPort = async (_req: Request, res: Response): Promise<void> => {
    const status = await this.getFederationPortUseCase.execute();
    res.status(200).json(status);
  };

  applyPort = async (req: Request, res: Response): Promise<void> => {
    const { settings } = await this.applyFederationPortUseCase.execute({
      actorId: req.userId!,
      port: req.body.port,
    });
    res.status(200).json({ port: settings.port, updatedAt: settings.updatedAt });
  };

  testConnection = async (req: Request, res: Response): Promise<void> => {
    const result = await this.testEnrollmentConnectionUseCase.execute({ code: req.body.code });
    res.status(200).json(result);
  };

  testInstanceConnection = async (req: Request, res: Response): Promise<void> => {
    const result = await this.testFederatedInstanceConnectionUseCase.execute(req.params.id as string);
    res.status(200).json(result);
  };
}
