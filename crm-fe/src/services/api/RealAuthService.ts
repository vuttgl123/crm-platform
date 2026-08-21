import {
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
  UserSessionContext,
  DemoRoleCode,
} from '@/types/auth';
import { IAuthService } from '../contracts/IAuthService';
import { apiFetch } from './apiClient';
import { storageAdapter } from '../storageAdapter';
import { DEMO_ROLES, DEMO_TENANT, DEMO_USERS } from '@/mocks/fixtures/demoData';
import { PlatformTenant, PlatformTenantMembership, PlatformUser } from '@/types/schema';
import { env } from '@/config/env';

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

    const session = this.mapToSessionContext(tokenResponse, meResponse, false);
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

    // Automatically submit membership request to Backend POST /api/membership-requests
    try {
      await apiFetch('/membership-requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify({
          tenantCode: payload.tenantCode?.trim(),
          message: `Đăng ký tài khoản thành viên mới từ ${payload.displayName}`,
        }),
      });
    } catch (err) {
      console.error('Không thể tạo đơn xin gia nhập với Backend PostgreSQL:', err);
    }

    const meResponse = await apiFetch<BackendMeResponse>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    const session = this.mapToSessionContext(tokenResponse, meResponse, true);
    storageAdapter.setSession(session);
    return session;
  }

  public async loginWithSSO(payload: SSOLoginPayload): Promise<UserSessionContext> {
    const provider = payload.provider === 'GOOGLE' ? 'google' : 'microsoft';
    window.location.assign(
      `${env.oauthBaseUrl}/oauth2/authorization/${provider}`
    );
    return new Promise<UserSessionContext>(() => undefined);
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

    const session = this.mapToSessionContext(tokenResponse, meResponse, false);
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
      storageAdapter.clearSession();
      return null;
    }
  }

  public async switchDemoRole(roleCode: DemoRoleCode): Promise<UserSessionContext> {
    const current = storageAdapter.getSession();
    const roleConfig = DEMO_ROLES[roleCode] || DEMO_ROLES.ADMIN;

    const session: UserSessionContext = {
      user: current ? current.user : DEMO_USERS.ADMIN,
      tenant: current ? current.tenant : DEMO_TENANT,
      membership: {
        tenant_id: current ? current.tenant.id : DEMO_TENANT.id,
        user_id: current ? current.user.id : DEMO_USERS.ADMIN.id,
        membership_status: 'ACTIVE',
        is_tenant_admin: roleConfig.isTenantAdmin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activeRole: {
        tenant_id: current ? current.tenant.id : DEMO_TENANT.id,
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
    meResponse: BackendMeResponse,
    isRegisterFlow = false
  ): UserSessionContext {
    const user: PlatformUser = {
      id: meResponse.user.id || tokenResponse.user.id,
      email: meResponse.user.email || tokenResponse.user.email,
      display_name: meResponse.user.displayName || tokenResponse.user.displayName,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const firstTenant = meResponse.tenants && meResponse.tenants.length > 0 ? meResponse.tenants[0] : null;
    
    // Determine admin status based on database created_by / tenantAdmin field from Backend
    const isTenantAdmin = Boolean(firstTenant?.tenantAdmin);

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
      : {
          id: 'tenant-ipa',
          tenant_code: 'TAP-DOAN-IPA',
          legal_name: 'Tập đoàn Đầu tư IPA',
          display_name: 'Tập đoàn IPA',
          default_currency_code: 'VND',
          default_country_code: 'VN',
          default_language_code: 'vi',
          default_timezone: 'Asia/Ho_Chi_Minh',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    const defaultRoleConfig = isTenantAdmin ? DEMO_ROLES.ADMIN : DEMO_ROLES.SALES_STAFF;

    const membership: PlatformTenantMembership = {
      tenant_id: tenant.id,
      user_id: user.id,
      membership_status: isTenantAdmin ? 'ACTIVE' : (isRegisterFlow ? 'INVITED' : (firstTenant ? 'ACTIVE' : 'INVITED')),
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
        id: isTenantAdmin ? 'role-tenant-admin' : 'role-sales-staff',
        role_code: isTenantAdmin ? 'TENANT_ADMIN' : 'SALES_STAFF',
        name: isTenantAdmin ? 'Quản trị viên Tập đoàn (Tenant Admin)' : 'Nhân viên Kinh doanh (Sales)',
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
