// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  CreateUserData,
  CreateViewerData,
  IUserRepository,
  UpdateViewerPermissionsData,
} from "../../../../application/ports/repositories/user-repository";
import { IUser } from "../../../../domain/entities/user";
import { UserDoc, UserModel } from "../schemas/user.schema";
import { HydratedDocument, Types } from "mongoose";
import { toDomainId } from "../to-domain-id";

export class MongooseUserRepository implements IUserRepository {
  async create(data: CreateUserData): Promise<IUser> {
    const doc = await UserModel.create({
      email: data.email.toLowerCase(),
      username: data.username?.toLowerCase().trim() || undefined,
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

  async countAdmins(): Promise<number> {
    return UserModel.countDocuments({ role: "admin" });
  }

  async findAllAdmins(): Promise<IUser[]> {
    const docs = await UserModel.find({ role: "admin" });
    return docs.map((doc) => this.toDomain(doc));
  }

  async updateAdminEmail(id: string, email: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await UserModel.findOneAndUpdate(
      { _id: id, role: "admin" },
      { email: email.toLowerCase() },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async setAdminBlocked(id: string, isBlocked: boolean): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await UserModel.findOneAndUpdate(
      { _id: id, role: "admin" },
      { isBlocked },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async deleteAdmin(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await UserModel.deleteOne({ _id: id, role: "admin" });
    return result.deletedCount > 0;
  }

  async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: expiresAt,
    });
  }

  async findByValidResetTokenHash(tokenHash: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+resetPasswordTokenHash");
    return doc ? this.toDomain(doc) : null;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    });
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

  async findAllViewersGlobal(): Promise<IUser[]> {
    const docs = await UserModel.find({ role: "viewer" });
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
      id: toDomainId(doc._id),
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
      isBlocked: doc.isBlocked ?? false,
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

  async deleteAllUsersExcept(keepUserId: string): Promise<{ deletedAdmins: number; deletedViewers: number }> {
    const [deletedAdmins, deletedViewers] = await Promise.all([
      UserModel.deleteMany({ role: "admin", _id: { $ne: keepUserId } }),
      UserModel.deleteMany({ role: "viewer", _id: { $ne: keepUserId } }),
    ]);
    return {
      deletedAdmins: deletedAdmins.deletedCount ?? 0,
      deletedViewers: deletedViewers.deletedCount ?? 0,
    };
  }
}
