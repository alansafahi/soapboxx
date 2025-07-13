import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Mail, 
  Bell, 
  MessageSquare, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageHistoryProps {
  messages: any[];
  isLoading: boolean;
}

export default function MessageHistory({ messages, isLoading }: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter messages based on search term and type
  const filteredMessages = (messages || []).filter((message: any) => {
    const matchesSearch = !searchTerm || 
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.senderName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || message.communicationType === filterType || message.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'emergency_broadcast':
        return <Bell className="w-4 h-4 text-red-500" />;
      case 'announcement':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'prayer_request':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-green-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Message History
        </CardTitle>
        
        {/* Filter and Search Controls */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="emergency_broadcast">Emergency Broadcasts</SelectItem>
              <SelectItem value="prayer_request">Prayer Requests</SelectItem>
              <SelectItem value="event">Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Info about recipient counts */}
        {filteredMessages.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Recipient counts show active church members who received the message. Click the eye icon to view message details.
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading message history...</p>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="space-y-3">
            {filteredMessages.map((message: any, index: number) => (
              <div key={message.id || index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1">
                      {getMessageIcon(message.communicationType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {message.subject || 'No Subject'}
                        </h3>
                        {getStatusBadge(message.deliveryStatus)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{message.recipientCount || 0} recipients</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span>By {message.senderName || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {message.sentAt ? 
                              formatDistanceToNow(new Date(message.sentAt), { addSuffix: true }) : 
                              'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="View message details">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getMessageIcon(message.communicationType)}
                            {message.subject || 'No Subject'}
                          </DialogTitle>
                          <DialogDescription>
                            Message details and delivery information
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Message Content */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Message Content</h4>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                          
                          {/* Delivery Information */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Delivery Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <span>{getStatusBadge(message.deliveryStatus)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Recipients:</span>
                                  <span>{message.recipientCount} members</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Type:</span>
                                  <span className="capitalize">{message.communicationType.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Sent:</span>
                                  <span>
                                    {message.sentAt ? 
                                      formatDistanceToNow(new Date(message.sentAt), { addSuffix: true }) : 
                                      'Unknown'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2">Sender Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Name:</span>
                                  <span>{message.senderName || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span className="text-xs">{message.sender?.email || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterType !== 'all' ? 'No messages match your filters' : 'No messages sent yet'}
            </p>
            {(searchTerm || filterType !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}