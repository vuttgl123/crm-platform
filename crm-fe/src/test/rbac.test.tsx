import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { canAccessEntity } from '@/core/permissions/evaluator';
import { SEEDED_PERMISSIONS } from '@/core/permissions/constants';
import { mockAuthService } from '@/services/mock/MockAuthService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { AuthProvider } from '@/core/session/AuthContext';
import { storageAdapter } from '@/services/mock/storageAdapter';

describe('RBAC & Data Scope Evaluation Tests', () => {
  it('10. Permission evaluation uses strictly seeded permission codes from SQL schema', () => {
    expect(SEEDED_PERMISSIONS).toHaveLength(19);
    expect(SEEDED_PERMISSIONS).toContain('crm_account.read');
    expect(SEEDED_PERMISSIONS).toContain('platform_user.manage');
    expect(SEEDED_PERMISSIONS).toContain('sales_quote.approve');
  });

  it('9. PermissionGate renders children for allowed actions and fallback for denied actions', async () => {
    const staffSession = await mockAuthService.switchDemoRole('SALES_STAFF');
    storageAdapter.setSession(staffSession);

    // Granted permission test
    const { unmount } = render(
      <AuthProvider>
        <PermissionGate permission="crm_account.read">
          <button data-testid="allowed-btn">Read Account</button>
        </PermissionGate>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('allowed-btn')).toBeInTheDocument();
    });
    unmount();

    // Denied permission test (Sales staff doesn't have sales_quote.approve)
    render(
      <AuthProvider>
        <PermissionGate
          permission="sales_quote.approve"
          fallback={<div data-testid="denied-fallback">No Approve Permission</div>}
        >
          <button data-testid="approve-btn">Approve Quote</button>
        </PermissionGate>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('approve-btn')).not.toBeInTheDocument();
      expect(screen.getByTestId('denied-fallback')).toBeInTheDocument();
    });
  });

  it('11. Evaluates all 4 data scopes: TENANT, TEAM_TREE, TEAM, OWN', async () => {
    // TENANT scope (Admin)
    const adminSession = await mockAuthService.switchDemoRole('ADMIN');
    expect(
      canAccessEntity(
        { tenant_id: 'tenant-vum-001', team_id: 'team-other-999', created_by: 'other-user' },
        adminSession
      )
    ).toBe(true);

    // TEAM_TREE scope (Regional Manager)
    const managerSession = await mockAuthService.switchDemoRole('REGIONAL_MANAGER');
    // Miền Bắc (team-mb-001) has child team Hà Nội 1 (team-hn-001)
    expect(
      canAccessEntity(
        { tenant_id: 'tenant-vum-001', team_id: 'team-hn-001' },
        managerSession,
        ['team-hn-001']
      )
    ).toBe(true);

    // TEAM scope (Team Leader)
    const leaderSession = await mockAuthService.switchDemoRole('TEAM_LEADER');
    expect(
      canAccessEntity(
        { tenant_id: 'tenant-vum-001', team_id: 'team-hn-001' },
        leaderSession
      )
    ).toBe(true);
    expect(
      canAccessEntity(
        { tenant_id: 'tenant-vum-001', team_id: 'team-other-999' },
        leaderSession
      )
    ).toBe(false);

    // OWN scope (Sales Staff)
    const staffSession = await mockAuthService.switchDemoRole('SALES_STAFF');
    expect(
      canAccessEntity(
        { tenant_id: 'tenant-vum-001', created_by: staffSession.user.id },
        staffSession
      )
    ).toBe(true);
    expect(
      canAccessEntity(
        { tenant_id: 'tenant-vum-001', created_by: 'other-user-999' },
        staffSession
      )
    ).toBe(false);
  });

  it('12. Tenant isolation prevents cross-tenant access unconditionally', async () => {
    const adminSession = await mockAuthService.switchDemoRole('ADMIN');
    // Record belongs to different tenant
    const crossTenantRecord = {
      tenant_id: 'tenant-foreign-999',
      created_by: adminSession.user.id,
    };

    expect(canAccessEntity(crossTenantRecord, adminSession)).toBe(false);
  });
});
