// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { GetMetricsUseCase } from "../../../application/use-cases/system/get-metrics.usecase";

export class MetricsController {
  constructor(private readonly getMetricsUseCase: GetMetricsUseCase) {}

  handle = async (_req: Request, res: Response): Promise<void> => {
    const responseText = await this.getMetricsUseCase.execute();
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.status(200).send(responseText);
  };
}
