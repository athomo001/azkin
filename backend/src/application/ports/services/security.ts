export interface ITokenService {
  sign(userId: string): string;
  verify(token: string): { userId: string };
}

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
