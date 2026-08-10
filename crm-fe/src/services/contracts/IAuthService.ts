import {
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
  UserSessionContext,
  DemoRoleCode,
} from '@/types/auth';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<UserSessionContext>;
  register(payload: RegisterPayload): Promise<UserSessionContext>;
  loginWithSSO(payload: SSOLoginPayload): Promise<UserSessionContext>;
  logout(): Promise<void>;
  restoreSession(): Promise<UserSessionContext | null>;
  switchDemoRole(roleCode: DemoRoleCode): Promise<UserSessionContext>;
  expireSession(): void;
}
