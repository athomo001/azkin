import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import { asyncHandler } from "../middlewares/async-handler";

export function statsRoutes(controller: StatsController): Router {
  const router = Router();
  router.get("/monitor/:id/history", asyncHandler(controller.history));
  router.get("/tags", asyncHandler(controller.tags));
  router.get("/tags/:tagName/overview", asyncHandler(controller.tagOverview));
  return router;
}
