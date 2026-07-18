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
  user: UserOutput;
}
