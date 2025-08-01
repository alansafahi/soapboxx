import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Search, Plus, Send, Users, MoreVertical, Mail, MessageCircle, ChevronDown, ChevronRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  isEdited: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface Conversation {
  id: number;
  type: string;
  name?: string;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
}

interface ConversationDisplay {
  id: number;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  churchName?: string;
  isOnline?: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [expandedConversations, setExpandedConversations] = useState<Set<number>>(new Set());

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationDisplay[]>({
    queryKey: ["/api/chat/conversations"],
    enabled: true, // Remove auth requirement for testing
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat", selectedConversation],
    enabled: !!selectedConversation,
  });

  // Fetch contacts for new message
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: !!user,
  });

  // Fetch church members (users) for messaging 
  const { data: churchMembers = [], isLoading: membersLoading } = useQuery<any[]>({
    queryKey: ["/api/users/church-members"],
    queryFn: async () => {
      const response = await fetch('/api/users/church-members');
      if (!response.ok) return [];
      const data = await response.json();
      return data.users || [];
    },
    enabled: !!user,
  });

  // Handle auto-selection of contact from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('contact');
    const contactName = urlParams.get('name');
    
    // Only process if we have URL params
    if (contactId && contactName) {
      
      
      // First check in contacts list
      if (contacts && contacts.length > 0) {
        
        const foundContact = contacts.find(c => c.id === contactId);
        
        if (foundContact) {
          
          setSelectedContact(contactId);
          setSearchQuery(""); // Clear search to show all contacts
          setShowNewMessageDialog(true);
          toast({
            title: "Contact Selected",
            description: `Ready to message ${decodeURIComponent(contactName)}`,
          });
          
          // Clear URL parameters after handling them
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          return;
        }
      }
      
      // If not found in contacts, check in church members
      if (churchMembers && churchMembers.length > 0) {
        
        const foundMember = churchMembers.find(m => m.id.toString() === contactId);
        
        if (foundMember) {
          
          // Create a pseudo-contact object for the member
          const pseudoContact = {
            id: foundMember.id.toString(),
            firstName: foundMember.firstName,
            lastName: foundMember.lastName,
            email: foundMember.email,
            profileImageUrl: foundMember.profileImageUrl,
            isChurchMember: true
          };
          
          setSelectedContact(contactId);
          setSearchQuery(""); 
          setShowNewMessageDialog(true);
          toast({
            title: "Contact Selected", 
            description: `Ready to message ${decodeURIComponent(contactName)}`,
          });
          
          // Clear URL parameters after handling them
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          return;
        }
      }
      
      // If not found anywhere, show error
      
      toast({
        title: "Contact Not Found",
        description: `Could not find ${decodeURIComponent(contactName)}`,
        variant: "destructive"
      });
    }
  }, [location, toast, contacts, churchMembers]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      return apiRequest('POST', '/api/chat/send', data);
    },
    onSuccess: (data) => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest('POST', `/api/chat/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage,
    });
  };

  const handleNewMessage = (contactId: string, content: string) => {
    // For new messages, we'd need to create a conversation first
    // For now, just send to first conversation as demo
    if (conversations.length > 0) {
      sendMessageMutation.mutate({
        conversationId: conversations[0].id,
        content,
      });
    }
    setShowNewMessageDialog(false);
    setSelectedContact(null);
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversation(conversationId);
    setNewMessage(""); // Clear message input when switching conversations
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  // Combine contacts and church members into a unified list
  const allContacts = [
    ...contacts,
    ...churchMembers.map(member => ({
      id: member.id.toString(),
      firstName: member.firstName,
      lastName: member.lastName,
      profileImageUrl: member.profileImageUrl,
      role: member.role || 'Church Member',
      churchName: 'Church Member',
      isOnline: false
    }))
  ];

  const filteredContacts = allContacts.filter((contact) => {
    const searchMatch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const isSelected = selectedContact === contact.id;
    // Always show selected contact even if it doesn't match search
    return searchMatch || isSelected;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Connect with your faith community</p>
          </div>

          <Dialog open={showNewMessageDialog} onOpenChange={(open) => {
            setShowNewMessageDialog(open);
            if (!open) {
              setSelectedContact(null);
              setSearchQuery("");
              setNewMessage("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
                <DialogDescription>
                  {selectedContact ? 
                    "Contact already selected. Type your message below." : 
                    "Choose someone from your contacts or church members to start messaging"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts & church members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredContacts.map((contact: Contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          selectedContact === contact.id ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 ring-2 ring-purple-300' : ''
                        }`}
                        onClick={() => setSelectedContact(contact.id)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={contact.profileImageUrl} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {getInitials(contact.firstName, contact.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.role} {contact.churchName && `• ${contact.churchName}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {selectedContact === contact.id && (
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {selectedContact && (
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleNewMessage(selectedContact, newMessage)}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-340px)]">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No conversations found. Start a new message!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div key={conversation.id}>
                        <div
                          className={`flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                          }`}
                        >
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conversation.participantAvatar} />
                              <AvatarFallback className="bg-purple-600 text-white">
                                {getInitials(conversation.participantName.split(' ')[0], conversation.participantName.split(' ')[1] || '')}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            )}
                          </div>
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleSelectConversation(conversation.id)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {conversation.participantName}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                          
                          {/* Purple Circle Expansion Button */}
                          <div className="flex items-center gap-2">
                            {conversation.unreadCount > 0 && (
                              <Badge 
                                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[1.5rem] h-6 rounded-full text-xs cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const isExpanded = expandedConversations.has(conversation.id);

                                  
                                  setExpandedConversations(prev => {
                                    const newSet = new Set(prev);
                                    if (isExpanded) {
                                      newSet.delete(conversation.id);
                                    } else {
                                      newSet.add(conversation.id);
                                    }
                                    return newSet;
                                  });
                                  
                                  if (!isExpanded) {
                                    toast({
                                      title: "Messages Expanded",
                                      description: `Showing conversation messages`,
                                    });
                                  }
                                }}
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded Messages Section */}
                        {expandedConversations.has(conversation.id) && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Conversation Messages:
                              </div>
                              
                              {/* Sample Messages - Replace with actual messages from API */}
                              <div className="space-y-2">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Alan Safahi</span>
                                    <span>10:20 PM</span>
                                  </div>
                                  <p className="text-sm text-gray-900 dark:text-white">Hey, how are you doing?</p>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Community Member</span>
                                    <span>9:20 PM</span>
                                  </div>
                                  <p className="text-sm text-gray-900 dark:text-white">Thanks for the prayer support</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const conversation = conversations.find(c => c.id === selectedConversation);
                        return conversation ? (
                          <>
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={conversation.participantAvatar} />
                              <AvatarFallback className="bg-purple-600 text-white">
                                {getInitials(conversation.participantName.split(' ')[0], conversation.participantName.split(' ')[1] || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {conversation.participantName}
                              </h3>
                              {conversation.isOnline && (
                                <p className="text-sm text-green-600">Online now</p>
                              )}
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Block User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete Conversation</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-420px)] p-4">
                    {messagesLoading ? (
                      <div className="text-center text-gray-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message: Message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.senderId !== user?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.sender.profileImageUrl} />
                                <AvatarFallback className="bg-purple-600 text-white text-xs">
                                  {getInitials(message.sender.firstName, message.sender.lastName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[70%] ${message.senderId === user?.id ? 'order-first' : ''}`}>
                              <div
                                className={`p-3 rounded-lg ${
                                  message.senderId === user?.id
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                            {message.senderId === user?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback className="bg-purple-600 text-white text-xs">
                                  {getInitials(user.firstName || '', user.lastName || '')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={1}
                        className="flex-1 resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}