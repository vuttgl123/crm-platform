import React, { useEffect, useState } from 'react';
import {
  AuthState,
  DemoRoleCode,
  LoginCredentials,
  SSOLoginPayload,
} from '@/types/auth';
import { mockAuthService } from '@/services/mock/MockAuthService';
import { AuthContext } from './context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isExpired: false,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    mockAuthService
      .restoreSession()
      .then((session) => {
        if (!mounted) return;
        if (session) {
          setState({
            session,
            isAuthenticated: true,
            isLoading: false,
            isExpired: false,
            error: null,
          });
        } else {
          setState({
            session: null,
            isAuthenticated: false,
            isLoading: false,
            isExpired: false,
            error: null,
          });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setState({
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isExpired: false,
          error: null,
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const session = await mockAuthService.login(credentials);
      setState({
        session,
        isAuthenticated: true,
        isLoading: false,
        isExpired: false,
        error: null,
      });
      return session;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: msg,
      }));
      throw err;
    }
  };

  const loginWithSSO = async (payload: SSOLoginPayload) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const session = await mockAuthService.loginWithSSO(payload);
      setState({
        session,
        isAuthenticated: true,
        isLoading: false,
        isExpired: false,
        error: null,
      });
      return session;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập SSO thất bại';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: msg,
      }));
      throw err;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await mockAuthService.logout();
    setState({
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isExpired: false,
      error: null,
    });
  };

  const switchDemoRole = async (roleCode: DemoRoleCode) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const session = await mockAuthService.switchDemoRole(roleCode);
    setState({
      session,
      isAuthenticated: true,
      isLoading: false,
      isExpired: false,
      error: null,
    });
    return session;
  };

  const expireSession = () => {
    mockAuthService.expireSession();
    setState((prev) => ({
      ...prev,
      isExpired: true,
      isAuthenticated: false,
      session: null,
    }));
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithSSO,
        logout,
        switchDemoRole,
        expireSession,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
