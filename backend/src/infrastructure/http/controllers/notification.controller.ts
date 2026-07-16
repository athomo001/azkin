import { Request, Response } from "express";
import { CreateNotificationUseCase } from "../../../application/use-cases/notifications/create-notification.usecase";
import { ListNotificationsUseCase } from "../../../application/use-cases/notifications/list-notifications.usecase";
import { UpdateNotificationUseCase } from "../../../application/use-cases/notifications/update-notification.usecase";
import { DeleteNotificationUseCase } from "../../../application/use-cases/notifications/delete-notification.usecase";
import { TestNotificationUseCase } from "../../../application/use-cases/notifications/test-notification.usecase";

export class NotificationController {
  constructor(
    private readonly listUseCase: ListNotificationsUseCase,
    private readonly createUseCase: CreateNotificationUseCase,
    private readonly updateUseCase: UpdateNotificationUseCase,
    private readonly deleteUseCase: DeleteNotificationUseCase,
    private readonly testUseCase: TestNotificationUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const notifications = await this.listUseCase.execute(userId);
    res.status(200).json(notifications.map(n => ({
      id: n.id,
      name: n.name,
      type: n.type,
      config: n.config,
      isActive: n.isActive,
    })));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const notification = await this.createUseCase.execute({
      userId,
      name: req.body.name,
      type: req.body.type,
      config: req.body.config,
      isActive: req.body.isActive ?? true,
    });
    res.status(201).json({
      id: notification.id,
      name: notification.name,
      type: notification.type,
      config: notification.config,
      isActive: notification.isActive,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    const notification = await this.updateUseCase.execute(userId, id, {
      name: req.body.name,
      config: req.body.config,
      isActive: req.body.isActive,
    });
    res.status(200).json({
      id: notification.id,
      name: notification.name,
      type: notification.type,
      config: notification.config,
      isActive: notification.isActive,
    });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    await this.deleteUseCase.execute(userId, id);
    res.status(204).send();
  };

  test = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    await this.testUseCase.execute(userId, id);
    res.status(200).json({ message: "Notificación de prueba enviada exitosamente" });
  };
}
