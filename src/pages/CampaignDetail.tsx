import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, Video, FileText, Users, Calendar, Trophy, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submission, setSubmission] = useState({
    content: '',
    file: null as File | null,
    instagram: '',
    facebook: '',
    youtube: '',
    x: '',
    linkedin: ''
  });

  const [campaign, setCampaign] = useState<any>(null);

  // Fetch campaign data from Supabase
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching campaign:', error);
        toast({
          title: "Error",
          description: "Failed to load campaign details",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      if (data) {
        // Set default values for missing fields to maintain compatibility
        setCampaign({
          ...data,
          type: data.type || 'photo',
          status: data.status || 'active',
          requirements: data.requirements || [
            'Original content only',
            'High-quality submission',
            'Follow campaign guidelines'
          ],
          examples: data.examples || [
            'Be creative with your submission',
            'Show your unique perspective',
            'Make it engaging'
          ]
        });
      }
    };

    fetchCampaign();
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmission({ ...submission, file });
    }
  };

  const uploadFileToSupabase = async (file: File, campaignId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${campaignId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-submissions')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication Error",
          description: "Please sign in again to submit.",
          variant: "destructive",
        });
        return;
      }

      // Validate content
      if (!submission.content) {
        toast({
          title: "Content Required",
          description: "Please add a description for your submission",
          variant: "destructive",
        });
        return;
      }

      // Validate at least one social media link
      if (!submission.instagram && !submission.facebook && !submission.youtube && !submission.x && !submission.linkedin) {
        toast({
          title: "Social Media Required",
          description: "Please provide at least one social media link",
          variant: "destructive",
        });
        return;
      }

      // Get the user record using the auth_id from the session
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (lookupError || !existingUser) {
        console.error('User lookup error:', lookupError);
        toast({
          title: "User Error",
          description: "Could not find user record. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      // Create submission with simplified auth
      const { data: sessionUser } = await supabase.auth.getUser();
      
      if (!sessionUser?.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to submit.",
          variant: "destructive",
        });
        return;
      }

      // Get user record directly with auth_id
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', sessionUser.user.id)
        .single();

      if (userError || !userData?.id) {
        console.error('User lookup error:', userError);
        toast({
          title: "Error",
          description: "Could not find your user record. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      // Check if user exists with the auth_id
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', sessionUser.user.id)
        .single();

      if (userCheckError?.code === 'PGRST116' || !userCheck?.id) {
        // Only create if user truly doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            auth_id: sessionUser.user.id,
            name: sessionUser.user.email,
            role: 'user',
            points: 0,
            tokens_earned: 0
          })
          .select()
          .single();

        if (createError || !newUser) {
          console.error('Failed to create user:', createError);
          toast({
            title: "Error",
            description: `Failed to create user record: ${createError?.message || 'Unknown error'}`,
            variant: "destructive",
          });
          return;
        }
        userData = newUser;
      }

      // Create submission with verified user_id

      // --- Streak Logic ---
      // Fetch user's last_submission_date and streak
      const { data: streakUser, error: streakUserError } = await supabase
        .from('users')
        .select('id, streak, last_submission_date')
        .eq('id', userCheck?.id || userData.id)
        .single();

      let newStreak = 1;
      const today = new Date();
      let updateStreak = false;
      if (streakUser && streakUser.last_submission_date) {
        const lastDate = new Date(streakUser.last_submission_date);
        const diffDays = Math.floor((today.setHours(0,0,0,0) - lastDate.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          // Already submitted today, don't increment streak
          newStreak = streakUser.streak;
        } else if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak = streakUser.streak + 1;
          updateStreak = true;
        } else {
          // Missed a day, reset streak
          newStreak = 1;
          updateStreak = true;
        }
      } else {
        // First submission
        newStreak = 1;
        updateStreak = true;
      }

      if (updateStreak || !streakUser?.last_submission_date || streakUser?.streak !== newStreak) {
        await supabase
          .from('users')
          .update({ streak: newStreak, last_submission_date: new Date().toISOString().slice(0, 10) })
          .eq('id', userCheck?.id || userData.id);
      }

      // Create submission with verified user_id
      const { data, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          campaign_id: campaign.id,
          user_id: userCheck?.id || userData.id,
          content: submission.content,
          submission_type: campaign.type,
          instagram_link: submission.instagram || null,
          facebook_link: submission.facebook || null,
          youtube_link: submission.youtube || null,
          x_link: submission.x || null,
          linkedin_link: submission.linkedin || null,
          status: 'pending'
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Submission error details:', {
          message: submissionError.message,
          details: submissionError.details,
          hint: submissionError.hint
        });
        toast({
          title: "Submission Failed",
          description: submissionError.message || "There was an error saving your submission. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.error('No data returned from submission');
        toast({
          title: "Submission Error",
          description: "Failed to confirm submission. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Success case
      toast({
        title: "Submission Successful!",
        description: "Your submission has been sent for review. You'll be notified once it's approved.",
        variant: "default",
      });

      // Reset form
      setIsSubmitOpen(false);
      setSubmission({
        content: '',
        file: null,
        instagram: '',
        facebook: '',
        youtube: '',
        x: '',
        linkedin: ''
      });
      
      // Navigate to submissions page
      setTimeout(() => {
        navigate('/my-submissions');
      }, 1500);

    } catch (error) {
      console.error('Error submitting campaign:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      default: return <Camera className="w-5 h-5" />;
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = campaign.end_date ? new Date(campaign.end_date) < new Date() : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Header */}
            <Card className="glass-card neon-glow mb-8">
              <CardHeader>
                <div className="flex flex-col space-y-8">
                  {/* Campaign Title and Points */}
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-5xl font-bold">by {campaign.name || campaign.company}</CardTitle>
                    <div className="flex flex-col items-center bg-gradient-primary/10 rounded-xl p-4 border border-primary/20">
                      <Trophy className="w-6 h-6 text-primary mb-1" />
                      <span className="text-2xl font-semibold text-primary">
                        {campaign.points || campaign.reward || 0}
                      </span>
                      <span className="text-sm text-primary/80">points</span>
                    </div>
                  </div>
                  
                  {/* Campaign Info */}
                  <div className="grid md:grid-cols-3 gap-6 bg-muted/5 p-4 rounded-lg border border-muted/10">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(campaign.type)}
                      <span className="capitalize text-muted-foreground">{campaign.type} submission</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-neon-purple" />
                      <span className="text-muted-foreground">
                        {campaign.participants ? `${campaign.participants} participants` : 'No participants yet'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-neon-cyan" />
                      <span className={isDeadlinePassed ? 'text-destructive' : 'text-muted-foreground'}>
                        End Date: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'No deadline set'}
                      </span>
                    </div>
                  </div>

                  {isDeadlinePassed && (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 mt-6">
                      <p className="text-destructive font-medium">This campaign has ended</p>
                      <p className="text-destructive/80 text-sm">Submissions are no longer accepted</p>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Campaign Details */}
            <div className="mb-8 bg-muted/5 p-6 rounded-lg border border-muted/10">
              <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
              <div className="text-muted-foreground text-lg leading-relaxed">
                {campaign.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Submit Section */}
            <Card className="glass-card neon-glow sticky top-24">
              <CardHeader>
                <CardTitle className="gradient-text">Ready to Participate?</CardTitle>
                <CardDescription>
                  Submit your entry and earn {campaign.points || campaign.reward || 0} points
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.role === 'user' ? (
                  <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90 neon-glow"
                        disabled={isDeadlinePassed}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border/50 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-2xl">Submit Your Entry</DialogTitle>
                        <DialogDescription>
                          Add your social media links and description
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">

                        {/* Description Section */}
                        <div>
                          <Label htmlFor="content" className="text-lg font-semibold">Description</Label>
                          <Textarea
                            id="content"
                            value={submission.content}
                            onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                            placeholder="Describe your submission and share your story..."
                            className="mt-2"
                            rows={4}
                          />
                        </div>

                        {/* Social Handles Section */}
                        <div className="space-y-4">
                          <Label className="text-lg font-semibold">Social Handles</Label>
                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor="instagram">Instagram Link</Label>
                              <Input
                                id="instagram"
                                type="url"
                                placeholder="https://instagram.com/your_profile"
                                className="mt-1"
                                onChange={(e) => setSubmission(prev => ({ ...prev, instagram: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="facebook">Facebook Link</Label>
                              <Input
                                id="facebook"
                                type="url"
                                placeholder="https://facebook.com/your_profile"
                                className="mt-1"
                                onChange={(e) => setSubmission(prev => ({ ...prev, facebook: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="youtube">YouTube Link</Label>
                              <Input
                                id="youtube"
                                type="url"
                                placeholder="https://youtube.com/c/your_channel"
                                className="mt-1"
                                onChange={(e) => setSubmission(prev => ({ ...prev, youtube: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="x">X Link</Label>
                              <Input
                                id="x"
                                type="url"
                                placeholder="https://x.com/your_profile"
                                className="mt-1"
                                onChange={(e) => setSubmission(prev => ({ ...prev, x: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="linkedin">LinkedIn Link</Label>
                              <Input
                                id="linkedin"
                                type="url"
                                placeholder="https://linkedin.com/in/your_profile"
                                className="mt-1"
                                onChange={(e) => setSubmission(prev => ({ ...prev, linkedin: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>

                        <Button onClick={handleSubmit} className="w-full bg-gradient-primary hover:opacity-90 mt-6">
                          Submit Entry
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Only users can participate in campaigns
                    </p>
                    <Button variant="outline" onClick={() => navigate('/brand-dashboard')}>
                      Go to Brand Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
