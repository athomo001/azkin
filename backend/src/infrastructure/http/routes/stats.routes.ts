// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import { asyncHandler } from "../middlewares/async-handler";

export function statsRoutes(controller: StatsController): Router {
  const router = Router();
  router.get("/monitor/:id/history", asyncHandler(controller.history));
  router.get("/monitor/:id/events", asyncHandler(controller.monitorEvents));
  router.get("/groups", asyncHandler(controller.groups));
  router.get("/groups/:groupName/overview", asyncHandler(controller.groupOverview));
  router.get("/groups/:groupName/events", asyncHandler(controller.groupEvents));
  router.get("/recent", asyncHandler(controller.recentEvents));
  return router;
}
