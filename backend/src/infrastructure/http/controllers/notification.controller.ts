// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateNotificationUseCase } from "../../../application/use-cases/notifications/create-notification.usecase";
import { ListNotificationsUseCase } from "../../../application/use-cases/notifications/list-notifications.usecase";
import { UpdateNotificationUseCase } from "../../../application/use-cases/notifications/update-notification.usecase";
import { DeleteNotificationUseCase } from "../../../application/use-cases/notifications/delete-notification.usecase";
import { TestNotificationUseCase } from "../../../application/use-cases/notifications/test-notification.usecase";
import { isAlertEventType } from "../../../domain/value-objects/alert-event-type";
import { toNotificationResponse } from "../presenters/notification.presenter";

export class NotificationController {
  constructor(
    private readonly listUseCase: ListNotificationsUseCase,
    private readonly createUseCase: CreateNotificationUseCase,
    private readonly updateUseCase: UpdateNotificationUseCase,
    private readonly deleteUseCase: DeleteNotificationUseCase,
    private readonly testUseCase: TestNotificationUseCase,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const notifications = await this.listUseCase.execute();
    res.status(200).json(notifications.map(toNotificationResponse));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const notification = await this.createUseCase.execute({
      userId,
      name: req.body.name,
      type: req.body.type,
      config: req.body.config,
      isActive: req.body.isActive ?? true,
      events: req.body.events,
      templates: req.body.templates,
    });
    res.status(201).json(toNotificationResponse(notification));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    // req.body.type puede venir informado solo para validación de plantillas (el tipo de canal es inmutable).
    const notification = await this.updateUseCase.execute(id, {
      name: req.body.name,
      config: req.body.config,
      isActive: req.body.isActive,
      events: req.body.events,
      templates: req.body.templates,
    });
    res.status(200).json(toNotificationResponse(notification));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.deleteUseCase.execute(id);
    res.status(204).send();
  };

  test = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    const eventType = isAlertEventType(req.body?.eventType) ? req.body.eventType : "DOWN";
    await this.testUseCase.execute(userId, id, eventType);
    res.status(200).json({ message: "Notificación de prueba enviada exitosamente" });
  };
}
