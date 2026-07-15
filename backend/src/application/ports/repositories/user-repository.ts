import { IUser } from "../../../domain/entities/user";

export interface CreateUserData {
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<IUser>;
  /** Debe incluir el passwordHash (login lo necesita). */
  findByEmail(email: string): Promise<IUser | null>;
}
