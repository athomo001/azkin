// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateEnrollmentTokenUseCase } from "../../../application/use-cases/federation/create-enrollment-token.usecase";
import { JoinFederationUseCase } from "../../../application/use-cases/federation/join-federation.usecase";
import { AcceptEnrollmentUseCase } from "../../../application/use-cases/federation/accept-enrollment.usecase";
import { ListFederatedInstancesUseCase } from "../../../application/use-cases/federation/list-federated-instances.usecase";
import { RevokeFederatedInstanceUseCase } from "../../../application/use-cases/federation/revoke-federated-instance.usecase";
import { toFederatedInstanceResponse } from "../presenters/federation.presenter";

export class FederationController {
  constructor(
    private readonly createEnrollmentTokenUseCase: CreateEnrollmentTokenUseCase,
    private readonly joinFederationUseCase: JoinFederationUseCase,
    private readonly acceptEnrollmentUseCase: AcceptEnrollmentUseCase,
    private readonly listFederatedInstancesUseCase: ListFederatedInstancesUseCase,
    private readonly revokeFederatedInstanceUseCase: RevokeFederatedInstanceUseCase,
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
}
