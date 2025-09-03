import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
// Rank system based on streaks
const RANKS = [
  { name: 'Bronze 1', min: 0, max: 5, color: 'text-[#cd7f32]', emoji: '🛡️' },
  { name: 'Bronze 2', min: 6, max: 10, color: 'text-[#cd7f32]', emoji: '🛡️' },
  { name: 'Silver 1', min: 11, max: 15, color: 'text-[#C0C0C0]', emoji: '🛡️' },
  { name: 'Silver 2', min: 16, max: 25, color: 'text-[#C0C0C0]', emoji: '🛡️' },
  { name: 'Gold 1', min: 26, max: 40, color: 'text-[#FFD700]', emoji: '🛡️' },
  { name: 'Gold 2', min: 41, max: 50, color: 'text-[#FFD700]', emoji: '🛡️' },
];

function getRank(streak = 0) {
  return RANKS.find(r => streak >= r.min && streak <= r.max) || RANKS[0];
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
// ...existing code...
import { useNavigate } from 'react-router-dom';
import { Trophy, Coins, Gift, TrendingUp, Camera, Clock, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useWallet } from '@/contexts/WalletContext';
import { supabase } from '@/lib/supabaseClient';

const UserDashboard = () => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();

  // Fetch campaigns from Supabase and subscribe to changes
  const [campaigns, setCampaigns] = useState([]);
  
  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      return;
    }
    
    if (data) {
      console.log('Fetched campaigns for user dashboard:', data);
      setCampaigns(data);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:campaigns')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'campaigns' }, 
          (payload) => {
            console.log('Campaign change detected in user dashboard:', payload);
            fetchCampaigns();
          })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const [submissions] = useState([
    {
      id: '1',
      campaignTitle: 'Share Your Coffee Moment',
      submittedAt: '2024-09-01',
      status: 'approved',
      reward: 50
    },
    {
      id: '2',
      campaignTitle: 'Fitness Challenge',
      submittedAt: '2024-09-03',
      status: 'pending',
      reward: 75
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-muted/20 text-muted-foreground border-muted/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Rank dialog state
  const [showRanks, setShowRanks] = useState(false);
  const streak = user?.streak ?? 0;
  const currentRank = getRank(streak);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Connect Wallet Button (moved from Landing) */}
      <div className="flex justify-end mt-4">
        {(() => {
          const { isConnected, connectWallet, isConnecting } = useWallet();
          return !isConnected ? (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white neon-glow px-6 py-2 font-bold"
            >
              <span className="mr-2">🔗</span>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : null;
        })()}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground">
              Discover new campaigns and earn rewards
            </p>
          </div>
          {/* Rank Shield */}
          <div className="mt-4 md:mt-0 flex items-center">
            <button
              className={`flex items-center px-4 py-2 rounded-lg border border-border/50 bg-card/70 shadow hover:scale-105 transition-transform ${currentRank.color}`}
              onClick={() => setShowRanks(true)}
              title={`Current Rank: ${currentRank.name}`}
            >
              <span className="mr-2 text-2xl">{currentRank.emoji}</span>
              <span className="font-semibold text-base">{currentRank.name}</span>
            </button>
          </div>
        </div>

        {/* Ranks Dialog */}
        {showRanks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-lg p-6 shadow-xl min-w-[320px] relative">
              <button className="absolute top-2 right-2 text-lg" onClick={() => setShowRanks(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" />All Ranks</h2>
              <ul className="space-y-3">
                {RANKS.map(rank => (
                  <li key={rank.name} className={`flex items-center space-x-3 ${rank.color}`}>
                    <span className="text-2xl">{rank.emoji}</span>
                    <span className="font-semibold">{rank.name}</span>
                    <span className="text-xs text-muted-foreground">({rank.min} - {rank.max} streaks)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-accent">{user?.points}</p>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Points Remaining</p>
                  <p className="text-2xl font-bold text-neon-purple">{user?.pointsRemaining ?? user?.points ?? 0}</p>
                </div>
                <Coins className="w-8 h-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ETH Balance</p>
                  <p className="text-2xl font-bold text-neon-cyan">{balance}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/redeem')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Redeem</p>
                  <p className="text-2xl font-bold text-crypto-gold">Rewards</p>
                </div>
                <Gift className="w-8 h-8 text-crypto-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Campaigns */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Available Campaigns</h2>
              <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                View Leaderboard
              </Button>
            </div>
            
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="glass-card neon-glow hover:scale-[1.02] transition-transform cursor-pointer"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.title || campaign.name}</CardTitle>
                        <CardDescription className="text-accent">{campaign.company}</CardDescription>
                      </div>
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        +{campaign.reward || campaign.points} points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{campaign.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-muted-foreground">
                          <Camera className="w-4 h-4 mr-1" />
                          {campaign.type}
                        </span>
                        <span className="text-muted-foreground">
                          {campaign.num_applicants || 0} applicants
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        Due: {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : (campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : '')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold gradient-text">Recent Submissions</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/my-submissions')}>
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{submission.campaignTitle}</h3>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      {submission.status === 'approved' && (
                        <span className="text-green-400">+{submission.reward} points</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;