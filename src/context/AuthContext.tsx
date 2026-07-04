import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserDetailResponse, TokenResponse } from '@/types';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

interface AuthContextType {
  user: UserDetailResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<TokenResponse>;
  register: (data: { email: string; password: string; fullName: string; university: string; career: string }) => Promise<TokenResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      userService.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const response = await authService.signIn(data);
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser({
      id: 0,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
      creditsBalance: response.creditsBalance,
    });
    const fullUser = await userService.getMe();
    setUser(fullUser);
    return response;
  };

  const register = async (data: { email: string; password: string; fullName: string; university: string; career: string }) => {
    const response = await authService.signUp(data);
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser({
      id: 0,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
      creditsBalance: response.creditsBalance,
    });
    const fullUser = await userService.getMe();
    setUser(fullUser);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const refreshUser = async () => {
    const fullUser = await userService.getMe();
    setUser(fullUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
