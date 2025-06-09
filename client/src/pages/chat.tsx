import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Users, UserPlus, Check, X, ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends"],
    enabled: isAuthenticated,
  });

  // Fetch friend requests
  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/friend-requests"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: isAuthenticated && selectedConversation !== null,
    staleTime: 0,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  // Debug logging and scroll to bottom when messages change
  useEffect(() => {
    console.log('Selected conversation:', selectedConversation);
    console.log('Messages data:', messages);
    console.log('Messages array length:', Array.isArray(messages) ? messages.length : 'not array');
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Search users query
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    enabled: isAuthenticated && searchQuery.length >= 2,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      return await apiRequest("POST", `/api/conversations/${selectedConversation}/messages`, data);
    },
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (data: { participantIds: string[], type: string, name?: string }) => {
      return await apiRequest("POST", "/api/conversations", data);
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(conversation.id);
      toast({
        title: "Success",
        description: "Conversation started!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (data: { addresseeId: string }) => {
      return await apiRequest("POST", "/api/friend-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully.",
      });
      setSearchQuery("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Respond to friend request mutation
  const respondToFriendRequestMutation = useMutation({
    mutationFn: async (data: { friendshipId: number, status: 'accepted' | 'rejected' }) => {
      return await apiRequest("PATCH", `/api/friend-requests/${data.friendshipId}`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Success",
        description: "Friend request updated!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update friend request",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({ content: messageContent.trim() });
  };

  const startConversationWithFriend = (friendId: string, friendName: string) => {
    // Look for existing conversation that matches this friend
    const existingConversation = (conversations as any[]).find((conv: any) => 
      conv.type === 'direct' && conv.name && conv.name.includes(friendName)
    );
    
    if (existingConversation) {
      setSelectedConversation(existingConversation.id);
      toast({
        title: "Conversation selected",
        description: `Now chatting with ${friendName}`,
      });
      return;
    }
    
    // Create new conversation if none exists
    startConversationMutation.mutate({
      participantIds: [friendId],
      type: "direct",
      name: `Chat with ${friendName}`,
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || conversationsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Connect with friends and clergy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 h-[calc(100vh-120px)] flex flex-col md:pb-6 pb-20">
        {/* Mobile Search Toggle */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowUserSearch(!showUserSearch)}
            className="w-full justify-start gap-2"
          >
            <Search className="h-4 w-4" />
            Find Friends
          </Button>
        </div>

        {/* Mobile Search Panel */}
        {showUserSearch && (
          <div className="md:hidden mb-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Friends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {searchQuery.length >= 2 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchLoading ? (
                      <div className="text-sm text-gray-500 p-2">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((foundUser: any) => (
                        <div key={`mobile-${foundUser.id}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={foundUser.profileImageUrl} />
                              <AvatarFallback>
                                {foundUser.firstName?.[0] || foundUser.email?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <div className="font-medium">
                                {foundUser.firstName && foundUser.lastName 
                                  ? `${foundUser.firstName} ${foundUser.lastName}`
                                  : foundUser.email}
                              </div>
                            </div>
                          </div>
                          {foundUser.id !== user?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendFriendRequestMutation.mutate({ addresseeId: foundUser.id })}
                              disabled={sendFriendRequestMutation.isPending}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-2">No users found</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 hidden md:flex flex-col gap-4">
          {/* Friend Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Friends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              {searchQuery.length >= 2 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchLoading ? (
                    <div className="text-sm text-gray-500 p-2">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((foundUser: any) => (
                      <div key={`desktop-${foundUser.id}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={foundUser.profileImageUrl} />
                            <AvatarFallback>
                              {foundUser.firstName?.[0] || foundUser.email?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <div className="font-medium">
                              {foundUser.firstName && foundUser.lastName 
                                ? `${foundUser.firstName} ${foundUser.lastName}`
                                : foundUser.email}
                            </div>
                          </div>
                        </div>
                        {foundUser.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendFriendRequestMutation.mutate({ addresseeId: foundUser.id })}
                            disabled={sendFriendRequestMutation.isPending}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 p-2">No users found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Friend Requests
                  <Badge variant="secondary">{friendRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {friendRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requester?.profileImageUrl} />
                        <AvatarFallback>
                          {request.requester?.firstName?.[0] || request.requester?.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{request.requester?.firstName || 'Unknown'}</p>
                        <p className="text-gray-500">{request.requester?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToFriendRequestMutation.mutate({ friendshipId: request.id, status: 'accepted' })}
                        disabled={respondToFriendRequestMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToFriendRequestMutation.mutate({ friendshipId: request.id, status: 'rejected' })}
                        disabled={respondToFriendRequestMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Friends
                <Badge variant="secondary">{friends.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {friends.map((friend: any) => (
                    <div
                      key={`friendlist-${friend.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                      onClick={() => startConversationWithFriend(friend.id, friend.firstName || friend.email)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.profileImageUrl} />
                        <AvatarFallback>
                          {friend.firstName?.[0] || friend.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {friend.firstName && friend.lastName 
                            ? `${friend.firstName} ${friend.lastName}`
                            : friend.firstName || friend.email
                          }
                        </p>
                        <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No friends yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {conversations.map((conversation: any) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conversation.name || `Conversation ${conversation.id}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {conversation.type === 'direct' ? 'Direct Message' : 'Group Chat'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No conversations yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle>
                  {conversations.find((c: any) => c.id === selectedConversation)?.name || 'Chat'}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {Array.isArray(messages) && messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!Array.isArray(messages) || messages.length === 0) && (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a friend to start chatting or select an existing conversation
                </p>
              </div>
            </Card>
          )}
        </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center py-2 px-2">
          <Link href="/">
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-xs font-medium">Back</span>
            </button>
          </Link>
          <button 
            onClick={() => setShowUserSearch(!showUserSearch)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Search className="h-5 w-5" />
            <span className="text-xs font-medium">Search</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors bg-blue-600 text-white">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-medium">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}