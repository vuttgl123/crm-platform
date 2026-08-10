import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/core/session/AuthContext';
import { useAuth } from '@/core/session/useAuth';
import { mockAuthService } from '@/services/mock/MockAuthService';
import { storageAdapter } from '@/services/mock/storageAdapter';
import { LoginPage } from '@/features/auth/LoginPage';
import { DEMO_ROLES } from '@/mocks/fixtures/demoData';

const TestAuthConsumer = () => {
  const { session, isAuthenticated, isLoading, logout, switchDemoRole, expireSession } = useAuth();
  if (isLoading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="user-email">{session?.user.email || 'none'}</div>
      <div data-testid="active-role">{session?.activeRole.role_code || 'none'}</div>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={() => switchDemoRole('VIEWER')} data-testid="switch-role-btn">
        Switch to Viewer
      </button>
      <button onClick={() => expireSession()} data-testid="expire-session-btn">
        Expire Session
      </button>
    </div>
  );
};

describe('Authentication Foundation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it('1. Successful email/password login with mock admin credentials', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Địa chỉ Email/i);
    const passwordInput = screen.getByLabelText(/Mật khẩu/i);
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'admin@vum.vn');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Demo@123456');
    await user.click(submitBtn);

    await waitFor(() => {
      const stored = storageAdapter.getSession();
      expect(stored).not.toBeNull();
      expect(stored?.user.email).toBe('admin@vum.vn');
    });
  });

  it('1b. Failed email/password login with invalid credentials', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Địa chỉ Email/i);
    const passwordInput = screen.getByLabelText(/Mật khẩu/i);
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'wrong@vum.vn');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'WrongPass');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Email hoặc mật khẩu không chính xác/i)).toBeInTheDocument();
    });
  });

  it('2. Google and Microsoft mock SSO service paths', async () => {
    const googleSession = await mockAuthService.loginWithSSO({ provider: 'GOOGLE' });
    expect(googleSession.user.identity_provider).toBe('GOOGLE');
    expect(googleSession.grantedPermissions.length).toBeGreaterThan(0);

    const msSession = await mockAuthService.loginWithSSO({ provider: 'MICROSOFT' });
    expect(msSession.user.identity_provider).toBe('MICROSOFT');
  });

  it('3. Logout clears active session state and storage', async () => {
    const user = userEvent.setup();
    await mockAuthService.login({ email: 'admin@vum.vn', password: 'Demo@123456' });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    await user.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    });
    expect(storageAdapter.getSession()).toBeNull();
  });

  it('4. Session restoration and malformed storage cleanup', async () => {
    localStorage.setItem('vum_crm_mock_session_v1', '{ invalid json ...');
    expect(storageAdapter.getSession()).toBeNull();
  });

  it('5. Session expiry handling', async () => {
    const user = userEvent.setup();
    await mockAuthService.login({ email: 'admin@vum.vn', password: 'Demo@123456' });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    await user.click(screen.getByTestId('expire-session-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    });
  });

  it('13. Switching among all five demo roles', async () => {
    const roles = Object.keys(DEMO_ROLES) as (keyof typeof DEMO_ROLES)[];
    for (const roleCode of roles) {
      const session = await mockAuthService.switchDemoRole(roleCode);
      expect(session.activeRole.role_code).toBe(roleCode);
      expect(session.effectiveScopeType).toBe(DEMO_ROLES[roleCode].scopeType);
    }
  });
});
