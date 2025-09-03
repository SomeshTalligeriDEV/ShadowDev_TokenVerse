import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, User, Building, LogOut, Home, Coins } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { NotificationBell } from './NotificationBell';

const Navbar = () => {

  const { user, logout, setUser } = useAuth();
  const { account, disconnectWallet } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [streak, setStreak] = useState<number>(0);
  useEffect(() => {
    const fetchStreakAndTokens = async () => {
      if (user && user.id) {
        const { data, error } = await supabase
          .from('users')
          .select('streak, tokens_earned')
          .eq('id', user.id)
          .single();
        if (data) {
          setStreak(typeof data.streak === 'number' ? data.streak : 0);
          // Update tokensEarned in user context for live UI
          if (typeof data.tokens_earned === 'number') {
            setUser((prev) => prev ? { ...prev, tokensEarned: data.tokens_earned } : prev);
          }
        }
      }
    };
    fetchStreakAndTokens();
    // Listen for storage events to force update on token purchase
    const onStorage = () => fetchStreakAndTokens();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/');
  };

  const isUserDashboard = location.pathname === '/user-dashboard';
  const isBrandDashboard = location.pathname === '/brand-dashboard';

  return (
    <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold hero-gradient">Tokenverse</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Button>

                {user.role === 'user' && (
                  <>
                    <Button
                      variant={isUserDashboard ? "default" : "ghost"}
                      onClick={() => navigate('/user-dashboard')}
                      className={isUserDashboard ? "bg-gradient-primary" : ""}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/my-submissions')}
                    >
                      My Submissions
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/redeem')}
                    >
                      Redeem
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/leaderboard')}
                    >
                      Leaderboard
                    </Button>
                    {user.role === 'user' && (
                      <div className="inline-flex items-center">
                        <NotificationBell />
                      </div>
                    )}
```
                  </>
                )}

                {user.role === 'brand' && (
                  <>
                    <Button
                      variant={isBrandDashboard ? "default" : "ghost"}
                      onClick={() => navigate('/brand-dashboard')}
                      className={isBrandDashboard ? "bg-gradient-primary" : ""}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/shop')}
                      className="flex items-center space-x-2"
                    >
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span>Shop</span>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-card/50 rounded-lg px-3 py-2 border border-border/50">
                  {user.role === 'user' ? (
                    <User className="w-4 h-4 text-accent" />
                  ) : (
                    <Building className="w-4 h-4 text-neon-purple" />
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                  {user.role === 'user' && (
                    <span className="ml-2 flex items-center text-orange-500 font-semibold text-base" title="Daily Streak">
                      <span role="img" aria-label="fire">🔥</span> {streak}
                    </span>
                  )}
                </div>
                {/* Total Tokens for Brand */}
                {user.role === 'brand' && (
                  <div className="flex items-center space-x-2 bg-card/50 rounded-lg px-3 py-2 border border-border/50">
                    <span className="text-lg" role="img" aria-label="token">🪙</span>
                    <span className="text-sm font-semibold">Total Tokens:</span>
                    <span className="text-base font-bold text-yellow-500">{user.tokensEarned ?? 0}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;