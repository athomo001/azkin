import { Request, Response } from "express";
import { GetHistoryUseCase } from "../../../application/use-cases/stats/get-history.usecase";
import { GetTagsUseCase } from "../../../application/use-cases/stats/get-tags.usecase";
import { GetTagOverviewUseCase } from "../../../application/use-cases/stats/get-tag-overview.usecase";
import { toHistoryResponse, toTagOverviewResponse } from "../presenters/monitor.presenter";

export class StatsController {
  constructor(
    private readonly historyUseCase: GetHistoryUseCase,
    private readonly tagsUseCase: GetTagsUseCase,
    private readonly tagOverviewUseCase: GetTagOverviewUseCase,
  ) {}

  history = async (req: Request, res: Response): Promise<void> => {
    // Se extrae req.params.id forzando a string ya que en Express 5 el tipo puede resolverse como string | string[].
    const id = req.params.id as string;
    const beats = await this.historyUseCase.execute(req.userId!, id);
    res.status(200).json(toHistoryResponse(id, beats));
  };

  tags = async (req: Request, res: Response): Promise<void> => {
    const tags = await this.tagsUseCase.execute(req.userId!);
    res.status(200).json(tags);
  };

  tagOverview = async (req: Request, res: Response): Promise<void> => {
    // Se realiza un cast de req.params.tagName a string debido al cambio de firmas en Express 5.
    const tagName = req.params.tagName as string;
    const overview = await this.tagOverviewUseCase.execute(req.userId!, tagName);
    res.status(200).json(toTagOverviewResponse(overview));
  };
}
