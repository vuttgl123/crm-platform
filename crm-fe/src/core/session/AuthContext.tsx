import React, { useEffect, useState } from 'react';
import {
  AuthState,
  DemoRoleCode,
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
} from '@/types/auth';
import { authService } from '@/services';
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
    authService
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
      const session = await authService.login(credentials);
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

  const register = async (payload: RegisterPayload) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const session = await authService.register(payload);
      setState({
        session,
        isAuthenticated: true,
        isLoading: false,
        isExpired: false,
        error: null,
      });
      return session;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký tài khoản thất bại';
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
      const session = await authService.loginWithSSO(payload);
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
    await authService.logout();
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
    const session = await authService.switchDemoRole(roleCode);
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
    authService.expireSession();
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
        register,
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
