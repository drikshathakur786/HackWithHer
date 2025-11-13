// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAuthenticated = !!user;

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    console.log('✅ User logged in:', userData.email);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    console.log('👋 User logged out');
    
    // Redirect to home page
    window.location.href = '/';
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return false;
    }

    try {
      const BACKEND_URL = 'http://localhost:5000';
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('✅ Authentication verified:', userData.email);
        setIsLoading(false);
        return true;
      } else {
        console.log('❌ Authentication failed, clearing tokens');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Check authentication when the app loads
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};