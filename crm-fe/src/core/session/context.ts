import { createContext } from 'react';
import {
  AuthState,
  DemoRoleCode,
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
  UserSessionContext,
} from '@/types/auth';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<UserSessionContext>;
  register: (payload: RegisterPayload) => Promise<UserSessionContext>;
  loginWithSSO: (payload: SSOLoginPayload) => Promise<UserSessionContext>;
  logout: () => Promise<void>;
  switchDemoRole: (roleCode: DemoRoleCode) => Promise<UserSessionContext>;
  expireSession: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
