import { createContext } from 'react';
import {
  AuthState,
  DemoRoleCode,
  LoginCredentials,
  SSOLoginPayload,
  UserSessionContext,
} from '@/types/auth';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<UserSessionContext>;
  loginWithSSO: (payload: SSOLoginPayload) => Promise<UserSessionContext>;
  logout: () => Promise<void>;
  switchDemoRole: (roleCode: DemoRoleCode) => Promise<UserSessionContext>;
  expireSession: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
