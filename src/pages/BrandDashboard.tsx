import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { Plus, Eye, Users, TrendingUp, CheckCircle, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

const BrandDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    reward: '',
    deadline: '',
    type: 'photo'
  });

  // Fetch campaigns and submissions from Supabase
  const [campaigns, setCampaigns] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const fetchCampaigns = async () => {
    if (!user?.name) return;
    
    const { data, error } = await supabase
      .from('campaigns')
      .select()
      .eq('company', user.name);
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error fetching campaigns",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    if (data) {
      console.log('Fetched campaigns:', data);
      setCampaigns(data);
    }
  };

  const fetchSubmissions = async () => {
    if (!user?.name) return;
    
    // First get all campaign IDs for this brand
    const { data: campaignIds } = await supabase
      .from('campaigns')
      .select('id')
      .eq('company', user.name);
      
    if (!campaignIds?.length) return;
    
    // Then fetch submissions for these campaigns with user details
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users!submissions_user_id_fkey (
          name,
          wallet
        )
      `)
      .in('campaign_id', campaignIds.map(c => c.id));
    
    if (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error fetching submissions",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    if (data) {
      console.log('Fetched submissions:', data);
      setSubmissions(data);
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
            console.log('Campaign change detected:', payload);
            fetchCampaigns();
          })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Fetch submissions when the component mounts
  useEffect(() => {
    fetchCampaigns();
    fetchSubmissions();
    
    // Subscribe to real-time changes for both campaigns and submissions
    const campaignsSubscription = supabase
      .channel('public:campaigns')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'campaigns' }, 
          () => {
            fetchCampaigns();
          })
      .subscribe();

    const submissionsSubscription = supabase
      .channel('public:submissions')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'submissions' }, 
          () => {
            fetchSubmissions();
          })
      .subscribe();

    return () => {
      supabase.removeChannel(campaignsSubscription);
      supabase.removeChannel(submissionsSubscription);
    };
  }, [user?.name]);

  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.description || !newCampaign.reward || !newCampaign.deadline || !newCampaign.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const campaignData = {
      name: newCampaign.title,
      company: user?.name || '',
      description: newCampaign.description,
      points: parseInt(newCampaign.reward),
      num_applicants: 0,
      end_date: newCampaign.deadline,
      type: newCampaign.type,
      status: 'active'
    };

    console.log('Creating campaign with data:', campaignData);
    const { data, error } = await supabase.from('campaigns').insert([campaignData]).select();
    
    if (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    console.log('Created campaign:', data);
    
    // Immediately update the local state with the new campaign
    if (data && data[0]) {
      setCampaigns(prevCampaigns => [data[0], ...prevCampaigns]);
    }

    setNewCampaign({ title: '', description: '', reward: '', deadline: '', type: 'photo' });
    setIsCreateOpen(false);
    toast({
      title: "Campaign Created",
      description: "Your campaign is now live!",
    });
    
    // Fetch updated campaigns list
    fetchCampaigns();
  };

    const handleSubmissionAction = async (submissionId: string, action: 'approve' | 'reject') => {
      try {
        // Update submission status
        const { error: updateError } = await supabase
          .from('submissions')
          .update({ 
            status: action,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', submissionId);

        if (updateError) throw updateError;

        // Show fancy success toast
        toast({
          title: action === 'approve' ? "✨ Approved!" : "Submission Rejected",
          description: action === 'approve' 
            ? "The submission has been approved successfully!" 
            : "The submission has been rejected.",
          variant: "default",
          className: action === 'approve' ? "bg-gradient-primary text-primary-foreground" : undefined
        });

        // Refresh the submissions list
        fetchSubmissions();
      } catch (error: any) {
        console.error(`Error ${action}ing submission:`, error);
        toast({
          title: "Action Failed",
          description: `Failed to ${action} the submission. Please try again.`,
          variant: "destructive"
        });
      }
    };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-muted/20 text-muted-foreground border-muted/50';
    }
  };

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Brand Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your campaigns and engage with your community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold text-accent">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <Eye className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold text-neon-purple">{campaigns.reduce((sum, c) => sum + (c.num_applicants || 0), 0)}</p>
                </div>
                <Users className="w-8 h-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold text-neon-cyan">{submissions.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold text-crypto-gold">{submissions.filter(s => s.status === 'pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-crypto-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Campaigns Management */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Your Campaigns</h2>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90 neon-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/50 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="gradient-text text-2xl">Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Launch a new campaign to engage with your community
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Campaign Title</Label>
                      <Input
                        id="title"
                        value={newCampaign.title}
                        onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                        placeholder="Enter campaign title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCampaign.description}
                        onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                        placeholder="Describe your campaign..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reward">Reward Points</Label>
                        <Input
                          id="reward"
                          type="number"
                          value={newCampaign.reward}
                          onChange={(e) => setNewCampaign({ ...newCampaign, reward: e.target.value })}
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Campaign Type</Label>
                        <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="photo">Photo</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newCampaign.deadline}
                        onChange={(e) => setNewCampaign({ ...newCampaign, deadline: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateCampaign} className="w-full bg-gradient-primary hover:opacity-90">
                      Create Campaign
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="glass-card neon-glow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        {campaign.points} points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Applicants</p>
                        <p className="font-semibold text-accent">{campaign.num_applicants || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-semibold text-neon-purple">{campaign.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-semibold">{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pending Submissions */}
          <div>
            <h2 className="text-xl font-bold gradient-text mb-6">Pending Submissions</h2>
            
            <div className="space-y-4">
              {submissions.filter(s => s.status === 'pending').map((submission) => (
                <Card key={submission.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-medium text-sm mb-1">{submission.campaign_name}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">by {submission.users?.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {submission.users?.wallet?.slice(0, 6)}...{submission.users?.wallet?.slice(-4)}
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">{submission.content}</p>
                      {submission.instagram_link && (
                        <a href={submission.instagram_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-2 block">
                          View on Instagram
                        </a>
                      )}
                      {submission.facebook_link && (
                        <a href={submission.facebook_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                          View on Facebook
                        </a>
                      )}
                      {submission.youtube_link && (
                        <a href={submission.youtube_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                          View on YouTube
                        </a>
                      )}
                      {submission.x_link && (
                        <a href={submission.x_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                          View on X
                        </a>
                      )}
                      {submission.linkedin_link && (
                        <a href={submission.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                          View on LinkedIn
                        </a>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Submitted {new Date(submission.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmissionAction(submission.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSubmissionAction(submission.id, 'reject')}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {submissions.filter(s => s.status === 'pending').length === 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No pending submissions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;