import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  authService,
  type AuthRole,
  type AuthSession,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
  type UpdateProfilePayload,
} from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  role: AuthRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  signup: (payload: SignupPayload) => Promise<AuthSession>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const unauthenticatedState = {
  user: null,
  role: null,
  isAuthenticated: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setRole(session.role);
    setIsAuthenticated(Boolean(session.user && session.role));
  }, []);

  const clearSession = useCallback(() => {
    setUser(unauthenticatedState.user);
    setRole(unauthenticatedState.role);
    setIsAuthenticated(unauthenticatedState.isAuthenticated);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authService.getSession();
      applySession(session);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authService.login(payload);
    applySession(session);
    return session;
  }, [applySession]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const session = await authService.signup(payload);
    applySession(session);
    return session;
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updatedUser = await authService.updateProfile(payload);
    setUser((currentUser) => ({
      ...(currentUser ?? {}),
      ...updatedUser,
    }));
    return updatedUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isAuthenticated,
      isLoading,
      login,
      signup,
      updateProfile,
      logout,
      refreshSession,
    }),
    [user, role, isAuthenticated, isLoading, login, signup, updateProfile, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
