import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../../application/ports/services/security";

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly rounds = 10) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
