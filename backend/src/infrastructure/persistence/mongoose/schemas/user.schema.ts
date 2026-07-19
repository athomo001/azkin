// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface UserDoc {
  email?: string;
  username?: string;
  passwordHash: string;
  role: "admin" | "viewer";
  adminId: Types.ObjectId | null;
  permissions: {
    type: "all" | "group" | "monitor";
    value?: string;
  }[];
  isTvSessionEnabled: boolean;
  resetPasswordTokenHash?: string | null;
  resetPasswordExpiresAt?: Date | null;
  isBlocked: boolean;
  preferences: {
    nyanCatMode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
    username: { type: String, required: false, unique: true, sparse: true, trim: true },
    // select:false → el hash nunca vuelve en queries por defecto (seguridad).
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "viewer"], default: "admin", required: true },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
      required: function (this: any): boolean {
        return this.role === "viewer";
      },
    },
    permissions: [
      {
        type: { type: String, enum: ["all", "group", "monitor"], required: true },
        value: { type: String }, // Nombre del Monitor Group o ID del monitor individual
      },
    ],
    isTvSessionEnabled: { type: Boolean, default: false },
    resetPasswordTokenHash: { type: String, default: null, select: false, index: true },
    resetPasswordExpiresAt: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    preferences: {
      nyanCatMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = model<UserDoc>("User", userSchema);
