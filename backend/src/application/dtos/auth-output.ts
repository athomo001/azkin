// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface UserOutput {
  id: string;
  email?: string;
  username?: string;
  role: string;
  adminId?: string;
  permissions: { type: string; value?: string }[];
  isTvSessionEnabled: boolean;
  preferences: {
    nyanCatMode: boolean;
  };
}

export interface AuthOutput {
  token: string;
  /** Token de larga duración (7 días) para renovar la sesión — nunca se expone en el body de la
   * respuesta; el controller lo extrae y lo persiste como cookie HttpOnly (AZ-011/AZ-017). */
  refreshToken: string;
  user: UserOutput;
}
