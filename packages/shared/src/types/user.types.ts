export interface User {
  id: string;
  username: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Pick<User, 'id' | 'username' | 'displayName'>;
}
