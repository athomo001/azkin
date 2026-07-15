import { Schema, model } from "mongoose";

export interface UserDoc {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false → el hash nunca vuelve en queries por defecto (seguridad).
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = model<UserDoc>("User", userSchema);
