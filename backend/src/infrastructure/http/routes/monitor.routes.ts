import { Router } from "express";
import { MonitorController } from "../controllers/monitor.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { createMonitorSchema, updateMonitorSchema } from "../schemas/monitor.schema";

export function monitorRoutes(controller: MonitorController): Router {
  const router = Router();
  router.get("/", asyncHandler(controller.list));
  router.post("/", validateBody(createMonitorSchema), asyncHandler(controller.create));
  router.put("/:id", validateBody(updateMonitorSchema), asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));
  return router;
}
