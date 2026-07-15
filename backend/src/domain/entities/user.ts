export interface IUser {
  id: string;
  email: string;
  passwordHash: string; // nunca se expone fuera del dominio
  createdAt: Date;
  updatedAt: Date;
}
