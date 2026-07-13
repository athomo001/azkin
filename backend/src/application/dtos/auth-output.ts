export interface AuthOutput {
  token: string;
  user: { id: string; email: string };
}
