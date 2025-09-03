import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  wallet?: string;
  role: 'user' | 'brand';
  name: string;
  points: number;
  tokensEarned: number;
  createdAt: string;
  pointsRemaining?: number;
  streak?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: 'user' | 'brand', name: string) => Promise<void>;
  logout: () => void;
  updateUserPoints: (points: number) => void;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Expose setUser
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
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Fetch pointsRemaining, streak, and tokensEarned from Supabase on mount, user change, or storage event
  useEffect(() => {
    const fetchUserFields = async () => {
      if (user && user.id) {
        const { data, error } = await supabase
          .from('users')
          .select('points_remaining, streak, tokens_earned')
          .eq('id', user.id)
          .single();
        if (data) {
          setUser((prev) => prev ? { ...prev, pointsRemaining: data.points_remaining, streak: data.streak, tokensEarned: data.tokens_earned } : prev);
        }
      }
    };
    fetchUserFields();
    // Listen for storage events to force update on token purchase
    const onStorage = () => fetchUserFields();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user?.id]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_isAuthenticated') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const { account, isConnected } = useWallet();

  const login = async (role: 'user' | 'brand', name: string) => {
    try {
      // Get current session to get the user ID
      const { data: { session } } = await supabase.auth.getSession();
      const auth_id = session?.user?.id;

      // Create the user object with the Supabase user data
      const newUser: User = {
        id: auth_id,
        wallet: account || undefined,
        role,
        name,
        points: role === 'user' ? 150 : 0,
        tokensEarned: role === 'user' ? 25 : 0,
        createdAt: new Date().toISOString(),
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_isAuthenticated', 'true');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_isAuthenticated');
  };

  const updateUserPoints = (points: number) => {
    if (user) {
      const updatedUser = { ...user, points: user.points + points };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  // Remove auto-logout on wallet disconnect to prevent dashboard blanking
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUserPoints,
    isLoading,
    setUser, // Add setUser to allow external updates
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};