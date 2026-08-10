import {
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
  UserSessionContext,
  DemoRoleCode,
} from '@/types/auth';
import { IAuthService } from '../contracts/IAuthService';
import { apiFetch } from './apiClient';
import { storageAdapter } from '../mock/storageAdapter';
import { DEMO_ROLES, DEMO_TENANT, DEMO_USERS } from '@/mocks/fixtures/demoData';
import { PlatformTenant, PlatformTenantMembership, PlatformUser } from '@/types/schema';

export interface BackendAccessTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface BackendTenantSummary {
  tenantId: string;
  tenantCode: string;
  displayName: string;
  tenantAdmin: boolean;
}

export interface BackendMeResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  tenants: BackendTenantSummary[];
}

export class RealAuthService implements IAuthService {
  public async login(credentials: LoginCredentials): Promise<UserSessionContext> {
    const tokenResponse = await apiFetch<BackendAccessTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const meResponse = await apiFetch<BackendMeResponse>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    const session = this.mapToSessionContext(tokenResponse, meResponse);
    storageAdapter.setSession(session);
    return session;
  }

  public async register(payload: RegisterPayload): Promise<UserSessionContext> {
    const tokenResponse = await apiFetch<BackendAccessTokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        displayName: payload.displayName,
      }),
    });

    const meResponse = await apiFetch<BackendMeResponse>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    const session = this.mapToSessionContext(tokenResponse, meResponse);
    storageAdapter.setSession(session);
    return session;
  }

  public async loginWithSSO(payload: SSOLoginPayload): Promise<UserSessionContext> {
    const provider = payload.provider.toLowerCase();
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
    return new Promise(() => {});
  }

  public async handleOAuth2Callback(): Promise<UserSessionContext> {
    const tokenResponse = await apiFetch<BackendAccessTokenResponse>('/auth/refresh', {
      method: 'POST',
    });

    const meResponse = await apiFetch<BackendMeResponse>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    const session = this.mapToSessionContext(tokenResponse, meResponse);
    storageAdapter.setSession(session);
    return session;
  }

  public async logout(): Promise<void> {
    try {
      await apiFetch<void>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout network errors to ensure local cleanup
    } finally {
      storageAdapter.clearSession();
    }
  }

  public async restoreSession(): Promise<UserSessionContext | null> {
    const stored = storageAdapter.getSession();
    if (!stored) return null;

    try {
      const meResponse = await apiFetch<BackendMeResponse>('/auth/me', {
        method: 'GET',
      });

      const updatedUser: PlatformUser = {
        ...stored.user,
        id: meResponse.user.id,
        email: meResponse.user.email,
        display_name: meResponse.user.displayName,
      };

      const updatedSession: UserSessionContext = {
        ...stored,
        user: updatedUser,
      };

      storageAdapter.setSession(updatedSession);
      return updatedSession;
    } catch {
      try {
        const tokenResponse = await apiFetch<BackendAccessTokenResponse>('/auth/refresh', {
          method: 'POST',
        });
        const meResponse = await apiFetch<BackendMeResponse>('/auth/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
        });

        const refreshedSession = this.mapToSessionContext(tokenResponse, meResponse);
        storageAdapter.setSession(refreshedSession);
        return refreshedSession;
      } catch {
        storageAdapter.clearSession();
        return null;
      }
    }
  }

  public async switchDemoRole(roleCode: DemoRoleCode): Promise<UserSessionContext> {
    const current = storageAdapter.getSession();
    const roleConfig = DEMO_ROLES[roleCode];

    const session: UserSessionContext = {
      user: current ? current.user : DEMO_USERS.ADMIN,
      tenant: current ? current.tenant : DEMO_TENANT,
      membership: current
        ? current.membership
        : {
            tenant_id: DEMO_TENANT.id,
            user_id: DEMO_USERS.ADMIN.id,
            membership_status: 'ACTIVE',
            is_tenant_admin: roleConfig.isTenantAdmin,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
      activeRole: {
        tenant_id: DEMO_TENANT.id,
        id: `role-${roleCode.toLowerCase()}`,
        role_code: roleCode,
        name: roleConfig.nameVi,
        is_system: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activeScope: roleConfig.scopeType,
      grantedPermissions: roleConfig.permissions,
      effectiveScopeType: roleConfig.scopeType,
      sessionToken: current ? current.sessionToken : 'real-backend-jwt-placeholder',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    storageAdapter.setSession(session);
    return session;
  }

  public expireSession(): void {
    const session = storageAdapter.getSession();
    if (session) {
      storageAdapter.setSession({
        ...session,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });
    }
  }

  private mapToSessionContext(
    tokenResponse: BackendAccessTokenResponse,
    meResponse: BackendMeResponse
  ): UserSessionContext {
    const user: PlatformUser = {
      id: meResponse.user.id || tokenResponse.user.id,
      email: meResponse.user.email || tokenResponse.user.email,
      display_name: meResponse.user.displayName || tokenResponse.user.displayName,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const firstTenant = meResponse.tenants[0];
    const tenant: PlatformTenant = firstTenant
      ? {
          id: firstTenant.tenantId,
          tenant_code: firstTenant.tenantCode,
          legal_name: firstTenant.displayName,
          display_name: firstTenant.displayName,
          default_currency_code: 'VND',
          default_country_code: 'VN',
          default_language_code: 'vi',
          default_timezone: 'Asia/Ho_Chi_Minh',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : DEMO_TENANT;

    const isTenantAdmin = firstTenant ? firstTenant.tenantAdmin : true;
    const defaultRoleConfig = DEMO_ROLES.ADMIN;

    const membership: PlatformTenantMembership = {
      tenant_id: tenant.id,
      user_id: user.id,
      membership_status: 'ACTIVE',
      is_tenant_admin: isTenantAdmin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      user,
      tenant,
      membership,
      activeRole: {
        tenant_id: tenant.id,
        id: 'role-admin',
        role_code: 'ADMIN',
        name: defaultRoleConfig.nameVi,
        is_system: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activeScope: defaultRoleConfig.scopeType,
      grantedPermissions: defaultRoleConfig.permissions,
      effectiveScopeType: defaultRoleConfig.scopeType,
      sessionToken: tokenResponse.accessToken,
      expiresAt: new Date(Date.now() + (tokenResponse.expiresIn || 900) * 1000).toISOString(),
    };
  }
}

export const realAuthService = new RealAuthService();
