import type { AuthResponse, LoginDto } from '@papyrus/shared';

export type AuthUser = AuthResponse['user'];

export type LoginCredentials = LoginDto;

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  setAuth: (auth: Partial<Pick<AuthState, 'accessToken' | 'user'>>) => void;
}
