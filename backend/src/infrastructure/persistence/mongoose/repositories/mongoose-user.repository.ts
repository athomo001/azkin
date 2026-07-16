import {
  CreateUserData,
  CreateViewerData,
  IUserRepository,
  UpdateViewerPermissionsData,
} from "../../../../application/ports/repositories/user-repository";
import { IUser } from "../../../../domain/entities/user";
import { UserDoc, UserModel } from "../schemas/user.schema";
import { HydratedDocument, Types } from "mongoose";

export class MongooseUserRepository implements IUserRepository {
  async create(data: CreateUserData): Promise<IUser> {
    const doc = await UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: "admin",
      adminId: null,
      permissions: [],
      isTvSessionEnabled: false,
      preferences: { nyanCatMode: false },
    });
    return this.toDomain(doc);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    return doc ? this.toDomain(doc) : null;
  }

  async findByIdentifier(identifier: string): Promise<IUser | null> {
    const clean = identifier.toLowerCase().trim();
    const doc = await UserModel.findOne({
      $or: [
        { email: clean },
        { username: clean }
      ]
    }).select("+passwordHash");
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await UserModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async changePassword(id: string, newPasswordHash: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await UserModel.updateOne(
      { _id: id },
      { passwordHash: newPasswordHash }
    );
    return result.modifiedCount > 0;
  }

  async createViewer(data: CreateViewerData): Promise<IUser> {
    const doc = await UserModel.create({
      email: data.email?.toLowerCase() || undefined,
      username: data.username || undefined,
      passwordHash: data.passwordHash,
      role: "viewer",
      adminId: new Types.ObjectId(data.adminId),
      permissions: data.permissions.map((p) => ({
        type: p.type,
        value: p.value,
      })),
      isTvSessionEnabled: data.isTvSessionEnabled ?? false,
      preferences: { nyanCatMode: false },
    });
    return this.toDomain(doc);
  }

  async findAllViewers(adminId: string): Promise<IUser[]> {
    const docs = await UserModel.find({ role: "viewer", adminId });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findViewerById(adminId: string, id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await UserModel.findOne({ _id: id, role: "viewer", adminId });
    return doc ? this.toDomain(doc) : null;
  }

  async updateViewerPermissions(
    adminId: string,
    id: string,
    data: UpdateViewerPermissionsData,
  ): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updateData: any = {};
    if (data.permissions !== undefined) {
      updateData.permissions = data.permissions.map((p) => ({
        type: p.type,
        value: p.value,
      }));
    }
    if (data.isTvSessionEnabled !== undefined) {
      updateData.isTvSessionEnabled = data.isTvSessionEnabled;
    }

    const doc = await UserModel.findOneAndUpdate(
      { _id: id, role: "viewer", adminId },
      updateData,
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async deleteViewer(adminId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await UserModel.deleteOne({ _id: id, role: "viewer", adminId });
    return result.deletedCount > 0;
  }

  private toDomain(doc: HydratedDocument<UserDoc>): IUser {
    return {
      id: String(doc._id),
      email: doc.email,
      username: doc.username,
      passwordHash: doc.passwordHash ?? "",
      role: doc.role,
      adminId: doc.adminId ? String(doc.adminId) : undefined,
      permissions: (doc.permissions ?? []).map((p) => ({
        type: p.type,
        value: p.value,
      })),
      isTvSessionEnabled: doc.isTvSessionEnabled,
      preferences: {
        nyanCatMode: doc.preferences?.nyanCatMode ?? false,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Actualiza las preferencias visuales de un usuario (cualquier rol).
   */
  async updatePreferences(userId: string, prefs: { nyanCatMode: boolean }): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: { 'preferences.nyanCatMode': prefs.nyanCatMode }
    });
  }
}
