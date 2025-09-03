import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, X, Search, Filter, Camera, Video, FileText, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';

const MySubmissions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock submissions data
  const [submissions] = useState([
    {
      id: '1',
      campaignId: '1',
      campaignTitle: 'Share Your Coffee Moment',
      brand: 'CoffeeCorp',
      content: 'Amazing latte art at my local cafe! This barista is truly an artist. The heart design in my cappuccino made my morning so much better.',
      submittedAt: '2024-09-01T10:30:00Z',
      reviewedAt: '2024-09-02T14:20:00Z',
      status: 'approved',
      reward: 50,
      type: 'photo',
      fileName: 'coffee-art.jpg'
    },
    {
      id: '2',
      campaignId: '2',
      campaignTitle: 'Fitness Challenge',
      brand: 'FitGear',
      content: 'My morning workout routine: 30 minutes of HIIT training followed by stretching. Feeling stronger every day!',
      submittedAt: '2024-09-03T06:15:00Z',
      reviewedAt: null,
      status: 'pending',
      reward: 75,
      type: 'video',
      fileName: 'workout-routine.mp4'
    },
    {
      id: '3',
      campaignId: '3',
      campaignTitle: 'Tech Review Contest',
      brand: 'TechHub',
      content: 'Reviewing the new wireless earbuds - incredible sound quality and battery life. Perfect for my daily commute and workouts.',
      submittedAt: '2024-08-28T19:45:00Z',
      reviewedAt: '2024-08-30T11:10:00Z',
      status: 'rejected',
      reward: 100,
      type: 'text',
      fileName: null,
      feedback: 'Review needs more technical details and comparison with competitors.'
    },
    {
      id: '4',
      campaignId: '1',
      campaignTitle: 'Share Your Coffee Moment',
      brand: 'CoffeeCorp',
      content: 'Sunday morning coffee ritual with fresh croissants and newspaper. The perfect way to start a lazy weekend.',
      submittedAt: '2024-08-25T09:20:00Z',
      reviewedAt: '2024-08-26T16:30:00Z',
      status: 'approved',
      reward: 50,
      type: 'photo',
      fileName: 'sunday-coffee.jpg'
    }
  ]);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="w-4 h-4 text-accent" />;
      case 'video': return <Video className="w-4 h-4 text-neon-purple" />;
      case 'text': return <FileText className="w-4 h-4 text-neon-cyan" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalEarned = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + s.reward, 0);

  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            My Submissions
          </h1>
          <p className="text-muted-foreground">
            Track your campaign submissions and rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-accent">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                  <p className="text-2xl font-bold text-crypto-gold">{totalEarned}</p>
                </div>
                <Trophy className="w-8 h-8 text-crypto-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="glass-card neon-glow hover:scale-[1.01] transition-transform">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl">{submission.campaignTitle}</CardTitle>
                        {getTypeIcon(submission.type)}
                      </div>
                      <CardDescription className="text-accent font-medium">
                        by {submission.brand}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </Badge>
                      {submission.status === 'approved' && (
                        <Badge className="bg-gradient-primary text-primary-foreground">
                          +{submission.reward} points
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Submission Content:</h4>
                    <p className="text-muted-foreground">{submission.content}</p>
                  </div>
                  
                  {submission.fileName && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Attached File:</h4>
                      <p className="text-sm text-neon-cyan">{submission.fileName}</p>
                    </div>
                  )}

                  {submission.status === 'rejected' && submission.feedback && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <h4 className="font-medium text-red-400 mb-1">Feedback:</h4>
                      <p className="text-sm text-red-300">{submission.feedback}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Submitted: {formatDate(submission.submittedAt)}</span>
                      {submission.reviewedAt && (
                        <span>Reviewed: {formatDate(submission.reviewedAt)}</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaign/${submission.campaignId}`)}
                    >
                      View Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No submissions found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters to see more submissions.'
                    : 'Start participating in campaigns to see your submissions here.'
                  }
                </p>
                <Button onClick={() => navigate('/user-dashboard')} className="bg-gradient-primary hover:opacity-90">
                  Browse Campaigns
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubmissions;