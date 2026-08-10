import { IAuthService } from '../contracts/IAuthService';
import {
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
  UserSessionContext,
  DemoRoleCode,
} from '@/types/auth';
import {
  DEMO_PASSWORD,
  DEMO_ROLES,
  DEMO_TEAMS,
  DEMO_TENANT,
  DEMO_USERS,
} from '@/mocks/fixtures/demoData';
import { storageAdapter } from './storageAdapter';
import { env } from '@/config/env';

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAuthService implements IAuthService {
  private createSessionForRole(roleCode: DemoRoleCode): UserSessionContext {
    const roleDef = DEMO_ROLES[roleCode];
    const user = DEMO_USERS[roleCode];

    const assignedTeam =
      roleCode === 'REGIONAL_MANAGER'
        ? DEMO_TEAMS[0] // Miền Bắc
        : roleCode === 'TEAM_LEADER' || roleCode === 'SALES_STAFF'
        ? DEMO_TEAMS[1] // Hà Nội 1
        : undefined;

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

    return {
      user: { ...user, last_login_at: new Date().toISOString() },
      tenant: DEMO_TENANT,
      membership: {
        tenant_id: DEMO_TENANT.id,
        user_id: user.id,
        membership_status: 'ACTIVE',
        job_title: roleDef.nameVi,
        is_tenant_admin: roleDef.isTenantAdmin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activeRole: {
        tenant_id: DEMO_TENANT.id,
        id: `role-${roleCode.toLowerCase()}`,
        role_code: roleCode,
        name: roleDef.nameVi,
        description: roleDef.descriptionVi,
        is_system: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activeScope: roleDef.scopeType,
      assignedTeam,
      grantedPermissions: roleDef.permissions,
      effectiveScopeType: roleDef.scopeType,
      sessionToken: `mock-token-${roleCode.toLowerCase()}-${Date.now()}`,
      expiresAt,
    };
  }

  public async login(credentials: LoginCredentials): Promise<UserSessionContext> {
    await delay(env.mockDelayMs);

    const matchingRoleCode = (Object.keys(DEMO_ROLES) as DemoRoleCode[]).find(
      (code) => DEMO_ROLES[code].userEmail.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!matchingRoleCode) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (credentials.password && credentials.password !== DEMO_PASSWORD) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    const session = this.createSessionForRole(matchingRoleCode);
    storageAdapter.setSession(session);
    return session;
  }

  public async register(payload: RegisterPayload): Promise<UserSessionContext> {
    await delay(env.mockDelayMs);
    const session = this.createSessionForRole('ADMIN');
    session.user.email = payload.email;
    session.user.display_name = payload.displayName;
    storageAdapter.setSession(session);
    return session;
  }

  async loginWithSSO(payload: SSOLoginPayload): Promise<UserSessionContext> {
    await delay(env.mockDelayMs);

    if (payload.provider !== 'GOOGLE' && payload.provider !== 'MICROSOFT') {
      throw new Error('Phương thức đăng nhập SSO không được hỗ trợ.');
    }

    // Default to ADMIN role for SSO demonstration
    const session = this.createSessionForRole('ADMIN');
    session.user.identity_provider = payload.provider;
    session.user.external_subject = `sso-sub-${payload.provider.toLowerCase()}-12345`;
    storageAdapter.setSession(session);
    return session;
  }

  async logout(): Promise<void> {
    await delay(env.mockDelayMs / 2);
    storageAdapter.clearSession();
  }

  async restoreSession(): Promise<UserSessionContext | null> {
    await delay(env.mockDelayMs / 2);
    return storageAdapter.getSession();
  }

  async switchDemoRole(roleCode: DemoRoleCode): Promise<UserSessionContext> {
    await delay(100);
    const session = this.createSessionForRole(roleCode);
    storageAdapter.setSession(session);
    return session;
  }

  expireSession(): void {
    const session = storageAdapter.getSession();
    if (session) {
      session.expiresAt = new Date(Date.now() - 1000).toISOString();
      storageAdapter.setSession(session);
    }
  }
}

export const mockAuthService = new MockAuthService();
