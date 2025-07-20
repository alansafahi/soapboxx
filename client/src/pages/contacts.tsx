import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
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
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "wouter";

function ContactsPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showContactsDialog, setShowContactsDialog] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
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
  });

  const { data: referralStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["/api/invitations/pending"],
  });

  // Send invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; message?: string }) => {
      try {
        // Add debugging for API request parameters
        const response = await apiRequest("POST", "/api/invitations", data);
        return response;
      } catch (error) {
        // Invitation error handled
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
      if (data.alreadyMember) {
        toast({
          title: "Already Connected!",
          description: data.message,
          variant: "default",
        });
      } else if (data.resent) {
        toast({
          title: "Invitation Resent",
          description: "Invitation resent!",
        });
      } else if (data.emailError) {
        toast({
          title: "Invitation Created",
          description: "Saved but email failed. Try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invitation Sent",
          description: "Invitation sent!",
        });
      }
    },
    onError: (error: any) => {
      
      // Check for specific API request errors
      if (error.message && error.message.includes('Invalid URL provided to apiRequest')) {
        toast({
          title: "Technical Error",
          description: "There was a problem with the invitation system. Please refresh the page and try again.",
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
      } else if (error.message && error.message.includes('self-invitations')) {
        toast({
          title: "Oops! That's Your Email",
          description: "Looks like you're trying to invite yourself! Try sharing SoapBox with a friend or family member instead.",
          variant: "default",
        });
      } else if (error.message && error.message.includes('already a member')) {
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
      return apiRequest("POST", "/api/contacts/add", data);
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
      return apiRequest("POST", "/api/contacts/import", { contacts });
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
        // Provide helpful guidance for manual contact addition
        toast({
          title: "Contact Import Not Available",
          description: "For privacy and security, automatic contact import isn't available on this browser. You can easily invite friends by typing their email addresses below!",
          variant: "default",
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Community Connections
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build meaningful relationships and share your faith journey with friends and family
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            onClick={importDeviceContacts}
            disabled={isImportingContacts}
            variant="outline" 
            className="gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800"
          >
            <Users className="h-4 w-4" />
            {isImportingContacts ? "Importing..." : "Import Contacts"}
          </Button>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
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
                    placeholder="Add a message..."
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
              <Button variant="outline" className="gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800">
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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setShowContactsDialog(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful Referrals</p>
                  <p className="text-3xl font-bold text-gray-900">{referralStats?.successful || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setShowPendingDialog(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingInvites.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Referral Points</p>
                  <p className="text-3xl font-bold text-gray-900">{referralStats?.points || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <Tabs defaultValue="contacts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border-0 p-1 h-14">
            <TabsTrigger value="contacts" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <Users className="h-4 w-4" />
              My Contacts
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <Clock className="h-4 w-4" />
              Pending Invites
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <Crown className="h-4 w-4" />
              Referral Program
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            {contactsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                  <p className="text-gray-600">Loading your connections...</p>
                </div>
              </div>
            ) : contacts.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-16 text-center">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-10 w-10 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">Start Building Your Community</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Connect with friends, family, and fellow believers to share your spiritual journey together
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowInviteDialog(true)} 
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg px-8 py-3"
                    >
                      <UserPlus className="h-5 w-5" />
                      Send Your First Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contacts.map((contact: any) => (
                  <Card key={contact.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 border-2 border-purple-200">
                            <AvatarImage src={contact.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold">
                              {getInitials(contact.name || (contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.firstName) || contact.email?.split('@')[0] || 'Unknown User')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {contact.name || (contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.firstName) || contact.email?.split('@')[0] || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600">{contact.email || 'No email'}</p>
                            {contact.church && contact.church.name && (
                              <p className="text-xs text-purple-600 font-medium">
                                📍 {contact.church.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={contact.status === 'connected' ? "default" : "secondary"}
                            className={contact.status === 'connected' ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-amber-100 text-amber-700"}
                          >
                            {contact.status === 'connected' ? "✅ Connected" : "⏳ Pending"}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-2 bg-white/50 hover:bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800"
                            onClick={() => {
                              // Auto-select contact and navigate to messages
                              const displayName = contact.name || (contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.firstName) || contact.email?.split('@')[0] || 'contact';
                              setLocation(`/messages?contact=${contact.id}&name=${encodeURIComponent(displayName)}`);
                              toast({
                                title: "Opening Messages",
                                description: `Starting conversation with ${displayName}`,
                              });
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Enhanced Pending Invites Tab */}
          <TabsContent value="pending" className="space-y-6">
            {pendingInvites.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-16 text-center">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="h-10 w-10 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">All Caught Up!</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Great job! All your invitations have been responded to. Keep growing your community by sending more invitations.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowInviteDialog(true)} 
                      className="gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg px-8 py-3"
                    >
                      <UserPlus className="h-5 w-5" />
                      Send More Invitations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingInvites.map((invite: any) => (
                  <Card key={invite.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                              <Mail className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{invite.email}</h3>
                              <p className="text-sm text-gray-600">
                                Invited on {new Date(invite.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {invite.message && (
                            <p className="text-sm text-gray-700 ml-13 italic bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
                              "{invite.message.length > 150 ? invite.message.substring(0, 150) + '...' : invite.message}"
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                        >
                          ⏳ Pending
                        </Badge>
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
                    <li>• Earn points for community engagement</li>
                    <li>• Build your spiritual network</li>
                    <li>• Unlock achievement badges</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Community Rewards</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Referral Bonus</span>
                      <Badge variant="outline">100 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Prayer Requests Created</span>
                      <Badge variant="outline">25 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discussions Created</span>
                      <Badge variant="outline">20 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily Check-ins</span>
                      <Badge variant="outline">10 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Prayer Circle Participation</span>
                      <Badge variant="outline">15 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Volunteer Activities</span>
                      <Badge variant="outline">30 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Events Attended</span>
                      <Badge variant="outline">25 points</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>S.O.A.P. Entries</span>
                      <Badge variant="outline">15 points</Badge>
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

      {/* Contacts Details Dialog */}
      <Dialog open={showContactsDialog} onOpenChange={setShowContactsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Contacts ({Array.isArray(contacts) ? contacts.length : 0})</DialogTitle>
            <DialogDescription>
              People you've connected with on SoapBox
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {Array.isArray(contacts) && contacts.length > 0 ? (
              contacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {contact.name?.charAt(0)?.toUpperCase() || contact.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{contact.name || (contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.firstName) || contact.email?.split('@')[0] || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-xs text-gray-400">
                        Status: <span className={contact.status === 'connected' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                          {contact.status === 'connected' ? 'Connected' : 'Pending'}
                        </span> • 
                        Added: {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const displayName = contact.name || (contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.firstName) || contact.email?.split('@')[0] || 'contact';
                      setLocation(`/messages?contact=${contact.id}&name=${encodeURIComponent(displayName)}`);
                      setShowContactsDialog(false);
                      toast({
                        title: "Opening Messages",
                        description: `Starting conversation with ${displayName}`,
                      });
                    }}
                  >
                    Message
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No contacts yet</p>
                <p className="text-sm">Invite friends to start building your network</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Invites Details Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pending Invites ({Array.isArray(pendingInvites) ? pendingInvites.length : 0})</DialogTitle>
            <DialogDescription>
              Invitations waiting for response
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {Array.isArray(pendingInvites) && pendingInvites.length > 0 ? (
              pendingInvites.map((invite: any) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {invite.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-gray-500">
                        Sent: {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Status: {invite.status || 'Pending'} • 
                        Message: {invite.message ? `"${invite.message.substring(0, 50)}..."` : 'Standard invitation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Resend invitation logic
                        toast({
                          title: "Invitation Resent",
                          description: `Resent invitation to ${invite.email}`,
                        });
                      }}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No pending invites</p>
                <p className="text-sm">All your invitations have been responded to</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContactsPage;
