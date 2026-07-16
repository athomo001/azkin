import { Request, Response } from "express";
import { ExportBackupUseCase } from "../../../application/use-cases/backup/export-backup.usecase";
import { ImportBackupUseCase } from "../../../application/use-cases/backup/import-backup.usecase";

export class BackupController {
  constructor(
    private readonly exportUseCase: ExportBackupUseCase,
    private readonly importUseCase: ImportBackupUseCase,
  ) {}

  export = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const backup = await this.exportUseCase.execute(userId);
    res.status(200).json(backup);
  };

  import = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const result = await this.importUseCase.execute({
      userId,
      monitors: req.body.monitors,
    });
    res.status(200).json(result);
  };
}
