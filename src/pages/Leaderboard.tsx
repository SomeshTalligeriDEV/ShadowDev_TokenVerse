import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Leaderboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('all-time');

  // Mock leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      name: 'Alice Cooper',
      wallet: '0x1234...5678',
      points: 2450,
      tokensEarned: 245,
      campaignsCompleted: 12,
      successRate: 92,
      avatar: 'AC'
    },
    {
      rank: 2,
      name: 'Bob Wilson',
      wallet: '0x9876...4321',
      points: 2180,
      tokensEarned: 218,
      campaignsCompleted: 10,
      successRate: 88,
      avatar: 'BW'
    },
    {
      rank: 3,
      name: 'Charlie Brown',
      wallet: '0x5555...9999',
      points: 1950,
      tokensEarned: 195,
      campaignsCompleted: 9,
      successRate: 95,
      avatar: 'CB'
    },
    {
      rank: 4,
      name: 'Diana Prince',
      wallet: '0x7777...1111',
      points: 1720,
      tokensEarned: 172,
      campaignsCompleted: 8,
      successRate: 87,
      avatar: 'DP'
    },
    {
      rank: 5,
      name: 'Eva Rodriguez',
      wallet: '0x3333...7777',
      points: 1580,
      tokensEarned: 158,
      campaignsCompleted: 7,
      successRate: 91,
      avatar: 'ER'
    },
    {
      rank: 6,
      name: 'Frank Miller',
      wallet: '0x8888...2222',
      points: 1420,
      tokensEarned: 142,
      campaignsCompleted: 6,
      successRate: 89,
      avatar: 'FM'
    },
    {
      rank: 7,
      name: 'Grace Chen',
      wallet: '0x4444...8888',
      points: 1280,
      tokensEarned: 128,
      campaignsCompleted: 5,
      successRate: 93,
      avatar: 'GC'
    },
    {
      rank: 8,
      name: 'Henry Davis',
      wallet: '0x6666...3333',
      points: 1150,
      tokensEarned: 115,
      campaignsCompleted: 4,
      successRate: 85,
      avatar: 'HD'
    },
    {
      rank: 9,
      name: 'Ivy Thompson',
      wallet: '0x2222...6666',
      points: 980,
      tokensEarned: 98,
      campaignsCompleted: 3,
      successRate: 94,
      avatar: 'IT'
    },
    {
      rank: 10,
      name: user?.name || 'You',
      wallet: '0x1111...4444',
      points: user?.points || 150,
      tokensEarned: user?.tokensEarned || 25,
      campaignsCompleted: 2,
      successRate: 90,
      avatar: user?.name?.slice(0, 2).toUpperCase() || 'YU',
      isCurrentUser: true
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'from-amber-600/20 to-amber-700/20 border-amber-600/50';
      default: return 'from-muted/10 to-muted/20 border-border/50';
    }
  };

  // Stats for the top section
  const totalUsers = leaderboardData.length;
  const avgPoints = Math.round(leaderboardData.reduce((sum, user) => sum + user.points, 0) / totalUsers);
  const topPerformer = leaderboardData[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you rank against other community members
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-accent">{totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Points</p>
                  <p className="text-2xl font-bold text-neon-purple">{avgPoints}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                  <p className="text-2xl font-bold text-crypto-gold">{topPerformer.points}</p>
                  <p className="text-xs text-muted-foreground">{topPerformer.name}</p>
                </div>
                <Crown className="w-8 h-8 text-crypto-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold gradient-text">Rankings</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Timeframe:</span>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {leaderboardData.slice(0, 3).map((userEntry, index) => {
            const actualRank = userEntry.rank;
            return (
              <Card key={userEntry.rank} className={`glass-card bg-gradient-to-br ${getRankColor(actualRank)} border ${actualRank === 1 ? 'neon-glow animate-pulse-glow' : 'neon-glow'}`}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(actualRank)}
                  </div>
                  <CardTitle className="text-xl">{userEntry.name}</CardTitle>
                  <CardDescription className="text-xs font-mono">
                    {userEntry.wallet}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-accent">{userEntry.points}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-neon-purple">{userEntry.tokensEarned}</p>
                        <p className="text-muted-foreground">tokens</p>
                      </div>
                      <div>
                        <p className="font-medium text-neon-cyan">{userEntry.successRate}%</p>
                        <p className="text-muted-foreground">success</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Full Leaderboard */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Complete Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardData.map((userEntry) => (
                <div 
                  key={userEntry.rank} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    userEntry.isCurrentUser 
                      ? 'bg-gradient-primary/10 border-primary/50 neon-glow' 
                      : 'bg-muted/20 border-border/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(userEntry.rank)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {userEntry.avatar}
                      </div>
                      <div>
                        <h3 className={`font-medium ${userEntry.isCurrentUser ? 'text-accent' : ''}`}>
                          {userEntry.name}
                          {userEntry.isCurrentUser && (
                            <Badge className="ml-2 bg-gradient-primary text-primary-foreground">You</Badge>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">{userEntry.wallet}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-accent">{userEntry.points}</p>
                      <p className="text-muted-foreground">points</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-neon-purple">{userEntry.tokensEarned}</p>
                      <p className="text-muted-foreground">tokens</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-neon-cyan">{userEntry.campaignsCompleted}</p>
                      <p className="text-muted-foreground">campaigns</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-crypto-gold">{userEntry.successRate}%</p>
                      <p className="text-muted-foreground">success</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Info */}
        <Card className="glass-card mt-8">
          <CardHeader>
            <CardTitle className="gradient-text">How Rankings Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-accent flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Earning Points
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete campaigns to earn points</li>
                  <li>• Higher quality submissions earn bonus points</li>
                  <li>• Consistency rewards active participants</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-neon-purple flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Success Rate
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Percentage of approved submissions</li>
                  <li>• Quality matters more than quantity</li>
                  <li>• Higher success rate = better ranking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;