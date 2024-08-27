export interface AuthenticatedUser {
  id: number;
  username: string;
  [key: string]: unknown;
}