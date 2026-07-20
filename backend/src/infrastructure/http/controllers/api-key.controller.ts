// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateApiKeyUseCase } from "../../../application/use-cases/api-keys/create-api-key.usecase";
import { ListApiKeysUseCase } from "../../../application/use-cases/api-keys/list-api-keys.usecase";
import { RevokeApiKeyUseCase } from "../../../application/use-cases/api-keys/revoke-api-key.usecase";
import { DeleteApiKeyUseCase } from "../../../application/use-cases/api-keys/delete-api-key.usecase";

export class ApiKeyController {
  constructor(
    private readonly createUseCase: CreateApiKeyUseCase,
    private readonly listUseCase: ListApiKeysUseCase,
    private readonly revokeUseCase: RevokeApiKeyUseCase,
    private readonly deleteUseCase: DeleteApiKeyUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.adminId!;
    const result = await this.createUseCase.execute({
      adminId,
      name: req.body.name,
      scopes: req.body.scopes,
    });
    res.status(201).json(result);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.adminId!;
    const keys = await this.listUseCase.execute(adminId);
    res.status(200).json(keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      scopes: k.scopes,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
      revokedAt: k.revokedAt,
    })));
  };

  revoke = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.adminId!;
    const id = req.params.id as string;
    await this.revokeUseCase.execute(adminId, id);
    res.status(204).send();
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.adminId!;
    const id = req.params.id as string;
    await this.deleteUseCase.execute(adminId, id);
    res.status(204).send();
  };
}
