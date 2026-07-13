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
    const beats = await this.historyUseCase.execute(req.userId!, req.params.id);
    res.status(200).json(toHistoryResponse(req.params.id, beats));
  };

  tags = async (req: Request, res: Response): Promise<void> => {
    const tags = await this.tagsUseCase.execute(req.userId!);
    res.status(200).json(tags);
  };

  tagOverview = async (req: Request, res: Response): Promise<void> => {
    const overview = await this.tagOverviewUseCase.execute(req.userId!, req.params.tagName);
    res.status(200).json(toTagOverviewResponse(overview));
  };
}
