// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ListAuditLogUseCase } from "../../../application/use-cases/audit-log/list-audit-log.usecase";

export class AuditLogController {
  constructor(private readonly listUseCase: ListAuditLogUseCase) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 50;
    const entries = await this.listUseCase.execute(limit);
    res.status(200).json(entries);
  };
}
