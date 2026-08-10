import {
  LoginCredentials,
  SSOLoginPayload,
  UserSessionContext,
  DemoRoleCode,
} from '@/types/auth';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<UserSessionContext>;
  loginWithSSO(payload: SSOLoginPayload): Promise<UserSessionContext>;
  logout(): Promise<void>;
  restoreSession(): Promise<UserSessionContext | null>;
  switchDemoRole(roleCode: DemoRoleCode): Promise<UserSessionContext>;
  expireSession(): void;
}
