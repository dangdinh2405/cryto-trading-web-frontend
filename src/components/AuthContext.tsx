import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

interface User {
  userId: string;
  username: string;
  usernameId: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = api.getAccessToken();
      if (token) {
        const response = await api.getProfile();
        if (response.data) {
          setUser(response.data);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!user) return;

    const checkAndRefreshToken = async () => {
      if (api.isTokenExpiringSoon() && api.getRefreshToken()) {
        console.log('[Auth] Token expiring soon, refreshing...');
        const refreshed = await api.refreshAccessToken();
        if (!refreshed) {
          console.log('[Auth] Token refresh failed, logging out');
          setUser(null);
          api.clearTokens();
        } else {
          console.log('[Auth] Token refreshed successfully');
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRefreshToken, 60000);

    // Check immediately
    checkAndRefreshToken();

    // Check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefreshToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const login = async (usernameId: string, password: string) => {
    const response = await api.login(usernameId, password);

    if (response.error) {
      return { success: false, error: response.error };
    }

    // Fetch user profile
    const profileResponse = await api.getProfile();
    if (profileResponse.data) {
      setUser(profileResponse.data);
    }

    return { success: true };
  };

  const register = async (userData: any) => {
    const response = await api.register(userData);

    if (response.error) {
      return { success: false, error: response.error };
    }

    // Fetch user profile
    const profileResponse = await api.getProfile();
    if (profileResponse.data) {
      setUser(profileResponse.data);
    }

    return { success: true };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await api.getProfile();
    if (response.data) {
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }}>
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
