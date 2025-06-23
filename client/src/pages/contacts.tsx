import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Share2, 
  Copy, 
  Check,
  MessageCircle,
  Heart,
  Crown,
  Gift,
  Calendar,
  Star,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

function ContactsPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isImportingContacts, setIsImportingContacts] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user's contacts and referral stats
  const { data: contacts = [], isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("/api/contacts"),
  });

  const { data: referralStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
    queryFn: () => apiRequest("/api/referrals/stats"),
  });

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["/api/invitations/pending"],
    queryFn: () => apiRequest("/api/invitations/pending"),
  });

  // Send invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; message?: string }) => {
      console.log('🚀 Sending invitation request:', data);
      try {
        const response = await apiRequest("/api/invitations", {
          method: "POST",
          body: data
        });
        console.log('✅ Invitation response received:', response);
        return response;
      } catch (error) {
        console.error('❌ Invitation request failed:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      setInviteEmail("");
      setInviteMessage("");
      setShowInviteDialog(false);
      
      // Handle different response types
      if (data.resent) {
        toast({
          title: "Invitation Resent",
          description: "Your invitation has been resent successfully!",
        });
      } else if (data.emailError) {
        toast({
          title: "Invitation Created",
          description: "Invitation saved but email delivery failed. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invitation Sent",
          description: "Your invitation has been sent successfully!",
        });
      }
    },
    onError: (error: any) => {
      console.error('Invitation error:', error);
      
      // Check if user is already a member
      if (error.message && error.message.includes('already a member')) {
        toast({
          title: "Already a Member",
          description: "This person is already a member of SoapBox Super App. You can connect with them through the app instead.",
          variant: "destructive",
        });
      } else if (error.message && error.message.includes('500')) {
        toast({
          title: "Server Error",
          description: "The server is working but your browser session may be out of sync. Please refresh the page and try again.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          ),
        });
      } else if (error.message && error.message.includes('401')) {
        toast({
          title: "Authentication Required",
          description: "Please log in again and retry sending the invitation.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send invitation. Please refresh and try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (data: { userId: string; name: string }) => {
      return apiRequest("/api/contacts/add", {
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Added",
        description: "New contact has been added successfully!",
      });
    },
  });

  // Import device contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (contacts: any[]) => {
      return apiRequest("/api/contacts/import", {
        method: "POST",
        body: { contacts }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsImportingContacts(false);
      toast({
        title: "Contacts Imported",
        description: "Your device contacts have been imported successfully!",
      });
    },
    onError: () => {
      setIsImportingContacts(false);
      toast({
        title: "Import Failed",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send an invitation.",
        variant: "destructive",
      });
      return;
    }

    const defaultMessage = `Hi! I've been using SoapBox Super App for my spiritual journey and thought you might enjoy it too. It has daily Bible readings, prayer walls, and an amazing community of believers. Join me using my referral link!`;
    
    inviteMutation.mutate({
      email: inviteEmail.trim(),
      message: inviteMessage.trim() || defaultMessage
    });
  };

  const importDeviceContacts = async () => {
    try {
      setIsImportingContacts(true);
      
      // Check if Contact Picker API is supported
      if (!('contacts' in navigator && 'ContactsManager' in window)) {
        // Fallback: Ask user to manually add contacts or import from other sources
        toast({
          title: "Contact Import Not Supported",
          description: "Your browser doesn't support automatic contact import. Please add contacts manually using the invite feature.",
          variant: "destructive",
        });
        setIsImportingContacts(false);
        return;
      }

      // Request contacts with name and email
      const props = ['name', 'email', 'tel'];
      const opts = { multiple: true };
      
      // @ts-ignore - Contact Picker API types not fully supported yet
      const contacts = await navigator.contacts.select(props, opts);
      
      if (contacts && contacts.length > 0) {
        // Format contacts for our API
        const formattedContacts = contacts.map((contact: any) => ({
          name: contact.name?.[0] || 'Unknown Contact',
          email: contact.email?.[0] || '',
          phone: contact.tel?.[0] || '',
          source: 'device'
        })).filter((contact: any) => contact.email || contact.phone); // Only include contacts with email or phone
        
        if (formattedContacts.length > 0) {
          importContactsMutation.mutate(formattedContacts);
        } else {
          toast({
            title: "No Valid Contacts",
            description: "Selected contacts don't have email addresses or phone numbers.",
            variant: "destructive",
          });
          setIsImportingContacts(false);
        }
      } else {
        setIsImportingContacts(false);
      }
    } catch (error: any) {
      console.error('Contact import error:', error);
      
      if (error.name === 'AbortError') {
        toast({
          title: "Import Cancelled",
          description: "Contact import was cancelled by user.",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to access device contacts. Please check permissions and try again.",
          variant: "destructive",
        });
      }
      setIsImportingContacts(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `https://www.soapboxapp.org/?ref=${user?.id}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
      toast({
        title: "Link Copied",
        description: "Your referral link has been copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareToSocialMedia = (platform: string) => {
    const referralLink = `https://www.soapboxapp.org/?ref=${user?.id}`;
    const message = "Join me on SoapBox Super App - the best platform for spiritual growth and community! 🙏";
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("Join me on SoapBox Super App")}&body=${encodeURIComponent(message + "\n\n" + referralLink)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'UN'; // Unknown user fallback
    }
    return name
      .split(" ")
      .map(n => n && n[0] ? n[0] : '')
      .join("")
      .toUpperCase()
      .slice(0, 2) || 'UN';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts & Invitations</h1>
          <p className="text-muted-foreground">
            Connect with friends and share your faith journey
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={importDeviceContacts}
            disabled={isImportingContacts}
            variant="outline" 
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            {isImportingContacts ? "Importing..." : "Import Contacts"}
          </Button>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Friends
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Friends to SoapBox</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message to your invitation..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleSendInvite} 
                  className="w-full" 
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share SoapBox
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share SoapBox with Friends</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Your Referral Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={`https://www.soapboxapp.org/?ref=${user?.id}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button onClick={copyReferralLink} size="sm" variant="outline">
                      {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocialMedia("facebook")}
                    className="justify-start"
                  >
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocialMedia("twitter")}
                    className="justify-start"
                  >
                    Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocialMedia("whatsapp")}
                    className="justify-start"
                  >
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocialMedia("email")}
                    className="justify-start"
                  >
                    Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful Referrals</p>
                <p className="text-2xl font-bold">{referralStats?.successful || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Referral Points</p>
                <p className="text-2xl font-bold">{referralStats?.points || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" />
            My Contacts
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Invites
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-2">
            <Crown className="h-4 w-4" />
            Referral Program
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          {contactsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contacts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Contacts Yet</h3>
                  <p className="text-muted-foreground">
                    Start inviting friends to build your spiritual community!
                  </p>
                </div>
                <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Your First Friend
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {contacts.map((contact: any) => (
                <Card key={contact.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={contact.profileImageUrl} />
                          <AvatarFallback>{getInitials(contact.name || contact.firstName || contact.email?.split('@')[0] || 'Unknown User')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{contact.name || contact.firstName || contact.email?.split('@')[0] || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground">{contact.email || 'No email'}</p>
                          {contact.church && contact.church.name && (
                            <p className="text-xs text-muted-foreground">
                              {contact.church.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={contact.isActive ? "default" : "secondary"}>
                          {contact.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setLocation('/messages');
                            toast({
                              title: "Opening Messages",
                              description: `Starting conversation with ${contact.name || contact.firstName || 'contact'}`,
                            });
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Invites Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingInvites.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Pending Invitations</h3>
                  <p className="text-muted-foreground">
                    All your invitations have been responded to!
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingInvites.map((invite: any) => (
                <Card key={invite.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{invite.email}</h3>
                        <p className="text-sm text-muted-foreground">
                          Invited on {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                        {invite.message && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{invite.message.substring(0, 100)}..."
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Referral Program Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Referral Rewards Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">How it Works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Share your referral link with friends</li>
                    <li>• Earn 50 points for each successful signup</li>
                    <li>• Get bonus rewards for active users</li>
                    <li>• Redeem points for premium features</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Current Rewards</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Premium Voice (1 month)</span>
                      <Badge variant="outline">100 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ad-free Experience</span>
                      <Badge variant="outline">200 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Custom Prayer Themes</span>
                      <Badge variant="outline">150 points</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={() => setShowShareDialog(true)} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Now
                </Button>
                <Button variant="outline" onClick={copyReferralLink} className="gap-2">
                  {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ContactsPage;
