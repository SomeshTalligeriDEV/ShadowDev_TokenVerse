import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Smartphone, Coffee, Zap, ShoppingBag, Gamepad2, Trophy, Coins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const Redeem = () => {
  const { user, updateUserPoints } = useAuth();
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState('');

  // Mock rewards data
  const rewards = [
    {
      id: '1',
      title: '$5 Coffee Voucher',
      description: 'Redeem at any participating coffee shop',
      points: 100,
      category: 'Food & Drink',
      icon: Coffee,
      availability: 50,
      brand: 'CoffeeCorp'
    },
    {
      id: '2',
      title: '$10 Mobile Recharge',
      description: 'Top up your mobile phone balance',
      points: 200,
      category: 'Utilities',
      icon: Smartphone,
      availability: 100,
      brand: 'TelecomPlus'
    },
    {
      id: '3',
      title: '$25 Shopping Voucher',
      description: 'Use at any online or physical store',
      points: 500,
      category: 'Shopping',
      icon: ShoppingBag,
      availability: 25,
      brand: 'MegaMart'
    },
    {
      id: '4',
      title: 'Gaming Credits',
      description: '$15 worth of gaming platform credits',
      points: 300,
      category: 'Entertainment',
      icon: Gamepad2,
      availability: 75,
      brand: 'GameZone'
    },
    {
      id: '5',
      title: 'Crypto Tokens',
      description: 'Convert points to TVL tokens (1:1 ratio)',
      points: 50,
      category: 'Crypto',
      icon: Coins,
      availability: 999,
      brand: 'Tokenverse',
      minRedemption: 50
    },
    {
      id: '6',
      title: 'Premium Membership',
      description: '1-month premium access to streaming service',
      points: 400,
      category: 'Entertainment',
      icon: Zap,
      availability: 30,
      brand: 'StreamFlix'
    }
  ];

  const handleRedeem = () => {
    if (!selectedReward) return;

    if (!contactInfo && selectedReward.id !== '5') {
      toast({
        title: "Contact Information Required",
        description: "Please provide your contact information for reward delivery",
        variant: "destructive",
      });
      return;
    }

    if (user!.points < selectedReward.points) {
      toast({
        title: "Insufficient Points",
        description: `You need ${selectedReward.points - user!.points} more points for this reward`,
        variant: "destructive",
      });
      return;
    }

    // Deduct points
    updateUserPoints(-selectedReward.points);
    
    toast({
      title: "Reward Redeemed!",
      description: `${selectedReward.title} has been redeemed successfully. You'll receive your reward within 24 hours.`,
    });

    setIsRedeemOpen(false);
    setSelectedReward(null);
    setContactInfo('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food & Drink': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Utilities': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Shopping': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'Entertainment': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      case 'Crypto': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-muted/20 text-muted-foreground border-muted/50';
    }
  };

  const categories = [...new Set(rewards.map(r => r.category))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Redeem Rewards
          </h1>
          <p className="text-muted-foreground">
            Convert your points into amazing rewards
          </p>
        </div>

        {/* Points Balance */}
        <Card className="glass-card neon-glow mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-3xl font-bold text-accent">{user?.points || 0}</p>
              </div>
              <Trophy className="w-12 h-12 text-accent" />
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <Badge key={category} className={getCategoryColor(category)}>
              {category}
            </Badge>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const IconComponent = reward.icon;
            const canAfford = (user?.points || 0) >= reward.points;
            
            return (
              <Card key={reward.id} className={`glass-card ${canAfford ? 'neon-glow hover:scale-[1.02]' : 'opacity-60'} transition-all cursor-pointer`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reward.title}</CardTitle>
                        <CardDescription className="text-accent">{reward.brand}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(reward.category)}>
                      {reward.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{reward.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-neon-purple" />
                      <span className="text-sm text-muted-foreground">
                        {reward.availability} available
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-crypto-gold">{reward.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>

                  <Dialog open={isRedeemOpen && selectedReward?.id === reward.id} onOpenChange={(open) => {
                    setIsRedeemOpen(open);
                    if (!open) setSelectedReward(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className={`w-full ${canAfford ? 'bg-gradient-primary hover:opacity-90' : 'bg-muted'}`}
                        disabled={!canAfford}
                        onClick={() => setSelectedReward(reward)}
                      >
                        {canAfford ? 'Redeem Now' : 'Insufficient Points'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border/50">
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-2xl">Confirm Redemption</DialogTitle>
                        <DialogDescription>
                          You're about to redeem {reward.title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-muted/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <IconComponent className="w-8 h-8 text-accent" />
                            <div>
                              <h3 className="font-medium">{reward.title}</h3>
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm">Cost:</span>
                            <span className="font-bold text-crypto-gold">{reward.points} points</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Your balance after:</span>
                            <span className="font-bold text-accent">{(user?.points || 0) - reward.points} points</span>
                          </div>
                        </div>

                        {reward.id !== '5' && (
                          <div>
                            <Label htmlFor="contact">Contact Information</Label>
                            <Input
                              id="contact"
                              value={contactInfo}
                              onChange={(e) => setContactInfo(e.target.value)}
                              placeholder="Email or phone number for reward delivery"
                            />
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <Button variant="outline" onClick={() => setIsRedeemOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handleRedeem} className="flex-1 bg-gradient-primary hover:opacity-90">
                            Confirm Redemption
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="glass-card mt-12">
          <CardHeader>
            <CardTitle className="gradient-text">How Rewards Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-accent">Earning Points</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete campaigns to earn points</li>
                  <li>• Points are awarded when submissions are approved</li>
                  <li>• Bonus points for high-quality submissions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-neon-purple">Redeeming Rewards</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Rewards are delivered within 24 hours</li>
                  <li>• Digital rewards are sent via email</li>
                  <li>• Crypto tokens are minted to your wallet</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Redeem;