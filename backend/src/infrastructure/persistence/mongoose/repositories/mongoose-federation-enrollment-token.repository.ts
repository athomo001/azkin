// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Types } from "mongoose";
import {
  ConsumedFederationEnrollmentToken,
  CreateFederationEnrollmentTokenData,
  IFederationEnrollmentTokenRepository,
} from "../../../../application/ports/repositories/federation-enrollment-token-repository";
import { FederationEnrollmentTokenModel } from "../schemas/federation-enrollment-token.schema";

export class MongooseFederationEnrollmentTokenRepository implements IFederationEnrollmentTokenRepository {
  async create(data: CreateFederationEnrollmentTokenData): Promise<void> {
    await FederationEnrollmentTokenModel.create({
      tokenHash: data.tokenHash,
      createdById: new Types.ObjectId(data.createdById),
      expiresAt: data.expiresAt,
    });
  }

  async consumeValid(tokenHash: string): Promise<ConsumedFederationEnrollmentToken | null> {
    const doc = await FederationEnrollmentTokenModel.findOneAndDelete({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });
    return doc ? { createdById: String(doc.createdById) } : null;
  }
}
