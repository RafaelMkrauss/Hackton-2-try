'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    const storedToken = Cookies.get('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);

      // Armazenar dados
      Cookies.set('auth_token', access_token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', { email, password, name });
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);

      // Armazenar dados
      Cookies.set('auth_token', access_token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logout realizado com sucesso!');
    // Force redirect to home page
    window.location.href = '/';
  };
  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    loading: isLoading,
    isAuthenticated,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
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
