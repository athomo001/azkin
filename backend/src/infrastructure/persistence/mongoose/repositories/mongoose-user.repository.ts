import {
  CreateUserData,
  IUserRepository,
} from "../../../../application/ports/repositories/user-repository";
import { IUser } from "../../../../domain/entities/user";
import { UserDoc, UserModel } from "../schemas/user.schema";
import { HydratedDocument } from "mongoose";

export class MongooseUserRepository implements IUserRepository {
  async create(data: CreateUserData): Promise<IUser> {
    const doc = await UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
    });
    return this.toDomain(doc);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: HydratedDocument<UserDoc>): IUser {
    return {
      id: String(doc._id),
      email: doc.email,
      passwordHash: doc.passwordHash ?? "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
