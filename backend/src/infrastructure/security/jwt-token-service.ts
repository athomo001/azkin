import jwt from "jsonwebtoken";
import { ITokenService } from "../../application/ports/services/security";
import { UnauthorizedError } from "../../domain/errors/domain-error";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number,
  ) {}

  sign(userId: string): string {
    return jwt.sign({ sub: userId }, this.secret, { expiresIn: this.expiresInSeconds });
  }

  verify(token: string): { userId: string } {
    try {
      const payload = jwt.verify(token, this.secret) as jwt.JwtPayload;
      if (!payload.sub || typeof payload.sub !== "string") {
        throw new UnauthorizedError("Invalid token payload");
      }
      return { userId: payload.sub };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}
