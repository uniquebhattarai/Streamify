export interface JWTPayload {
  user_id: number | string;
  exp: number;
  iat: number;
  username?: string;
  email?: string;
  role?: string;
}

export interface User {
  id: number | string;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
}
