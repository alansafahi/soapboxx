import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  Users, 
  Mail, 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  Clock,
  Target,
  Megaphone,
  Shield
} from 'lucide-react';

export default function BulkCommunication() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    type: 'announcement',
    channels: ['email', 'in_app'],
    targetAudience: {
      allMembers: true,
      roles: [] as string[],
      departments: [] as string[]
    },
    priority: 'normal',
    requiresResponse: false
  });

  const [emergencyForm, setEmergencyForm] = useState({
    title: '',
    content: '',
    requiresResponse: false
  });

  const [showTemplateCreator, setShowTemplateCreator] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'announcements'
  });

  // Fetch message templates
  const { data: templates } = useQuery({
    queryKey: ['/api/communications/templates'],
    retry: 1
  });

  // Fetch existing messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/communications/messages'],
    retry: 1
  });

  // Create bulk message mutation
  const createMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communications/messages', data),
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "Your announcement has been delivered to the selected recipients."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/messages'] });
      resetMessageForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communications/templates', data),
    onSuccess: () => {
      toast({
        title: "Template saved successfully",
        description: "Your custom template has been added to the library."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/templates'] });
      setNewTemplate({ name: '', subject: '', content: '', category: 'announcements' });
      setShowTemplateCreator(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save template",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  // Emergency broadcast mutation
  const emergencyBroadcastMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communications/emergency-broadcast', data),
    onSuccess: () => {
      toast({
        title: "Emergency broadcast sent",
        description: "Urgent message delivered to all church members immediately."
      });
      setEmergencyForm({ title: '', content: '', requiresResponse: false });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send emergency broadcast",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetMessageForm = () => {
    setMessageForm({
      title: '',
      content: '',
      type: 'announcement',
      channels: ['email', 'in_app'],
      targetAudience: {
        allMembers: true,
        roles: [],
        departments: []
      },
      priority: 'normal',
      requiresResponse: false
    });
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setMessageForm(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleSubmitMessage = () => {
    if (!messageForm.title.trim() || !messageForm.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    if (messageForm.channels.length === 0) {
      toast({
        title: "No delivery method selected",
        description: "Please select at least one communication channel.",
        variant: "destructive"
      });
      return;
    }

    createMessageMutation.mutate(messageForm);
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in template name, subject, and content.",
        variant: "destructive"
      });
      return;
    }

    createTemplateMutation.mutate(newTemplate);
  };

  const handleEmergencyBroadcast = () => {
    if (!emergencyForm.title.trim() || !emergencyForm.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content for emergency broadcast.",
        variant: "destructive"
      });
      return;
    }

    emergencyBroadcastMutation.mutate(emergencyForm);
  };

  const useTemplate = (template: any) => {
    setMessageForm(prev => ({
      ...prev,
      title: template.subject,
      content: template.content,
      type: template.id.includes('emergency') || template.id.includes('urgent') ? 'urgent' : 'announcement'
    }));
    
    toast({
      title: "Template Applied",
      description: `"${template.name}" template has been loaded into the message form.`
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-blue-600" />
          Church Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Send announcements, emergency broadcasts, and messages to your congregation
        </p>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Broadcast</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        {/* Compose Message Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Compose Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Compose Announcement
                  </CardTitle>
                  <CardDescription>
                    Create and send messages to your congregation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Message Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title..."
                      value={messageForm.title}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter your message content here..."
                      rows={8}
                      value={messageForm.content}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Message Type</Label>
                      <Select 
                        value={messageForm.type} 
                        onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="announcement">General Announcement</SelectItem>
                          <SelectItem value="event">Event Information</SelectItem>
                          <SelectItem value="prayer_request">Prayer Request</SelectItem>
                          <SelectItem value="urgent">Urgent Notice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority Level</Label>
                      <Select 
                        value={messageForm.priority} 
                        onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="normal">Normal Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Delivery Channels</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'email', label: 'Email', icon: Mail },
                        { id: 'in_app', label: 'In-App', icon: Bell },
                        { id: 'push', label: 'Push Notifications', icon: MessageSquare },
                        { id: 'sms', label: 'SMS', icon: MessageSquare }
                      ].map(channel => (
                        <div key={channel.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={channel.id}
                            checked={messageForm.channels.includes(channel.id)}
                            onCheckedChange={(checked) => handleChannelChange(channel.id, checked as boolean)}
                          />
                          <Label htmlFor={channel.id} className="flex items-center gap-2 text-sm">
                            <channel.icon className="w-4 h-4" />
                            {channel.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Target Audience
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allMembers"
                          checked={messageForm.targetAudience.allMembers}
                          onCheckedChange={(checked) => 
                            setMessageForm(prev => ({
                              ...prev,
                              targetAudience: { ...prev.targetAudience, allMembers: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="allMembers" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Church Members
                        </Label>
                      </div>
                      
                      <div className="border-t pt-3">
                        <Label className="text-sm font-medium">Or select specific roles:</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { id: 'pastor', name: 'Pastors' },
                            { id: 'minister', name: 'Ministers' },
                            { id: 'staff', name: 'Staff Members' },
                            { id: 'member', name: 'General Members' }
                          ].map(role => (
                            <div key={role.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={role.id}
                                checked={messageForm.targetAudience.roles.includes(role.id)}
                                onCheckedChange={(checked) => {
                                  const currentRoles = messageForm.targetAudience.roles;
                                  const newRoles = checked 
                                    ? [...currentRoles, role.id]
                                    : currentRoles.filter(r => r !== role.id);
                                  setMessageForm(prev => ({
                                    ...prev,
                                    targetAudience: { 
                                      ...prev.targetAudience, 
                                      roles: newRoles,
                                      allMembers: newRoles.length === 0 && prev.targetAudience.departments.length === 0
                                    }
                                  }));
                                }}
                                disabled={messageForm.targetAudience.allMembers}
                              />
                              <Label htmlFor={role.id} className="text-sm">
                                {role.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <Label className="text-sm font-medium">Ministry departments:</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { id: 'youth', name: 'Youth Ministry' },
                            { id: 'children', name: 'Children\'s Ministry' },
                            { id: 'music', name: 'Music Ministry' },
                            { id: 'outreach', name: 'Outreach Team' }
                          ].map(dept => (
                            <div key={dept.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={dept.id}
                                checked={messageForm.targetAudience.departments.includes(dept.id)}
                                onCheckedChange={(checked) => {
                                  const currentDepts = messageForm.targetAudience.departments;
                                  const newDepts = checked 
                                    ? [...currentDepts, dept.id]
                                    : currentDepts.filter(d => d !== dept.id);
                                  setMessageForm(prev => ({
                                    ...prev,
                                    targetAudience: { 
                                      ...prev.targetAudience, 
                                      departments: newDepts,
                                      allMembers: newDepts.length === 0 && prev.targetAudience.roles.length === 0
                                    }
                                  }));
                                }}
                                disabled={messageForm.targetAudience.allMembers}
                              />
                              <Label htmlFor={dept.id} className="text-sm">
                                {dept.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresResponse"
                      checked={messageForm.requiresResponse}
                      onCheckedChange={(checked) => 
                        setMessageForm(prev => ({ ...prev, requiresResponse: checked as boolean }))
                      }
                    />
                    <Label htmlFor="requiresResponse">Requires response from recipients</Label>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSubmitMessage}
                      disabled={createMessageMutation.isPending}
                      className="flex-1"
                    >
                      {createMessageMutation.isPending ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetMessageForm}>
                      Clear Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Templates Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Message Templates</CardTitle>
                      <CardDescription>Quick-start with pre-written templates</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowTemplateCreator(!showTemplateCreator)}
                      className="shrink-0 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                    >
                      {showTemplateCreator ? 'Cancel' : '+ Create New'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {showTemplateCreator && (
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 space-y-3">
                      <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200">Create New Template</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="e.g., Weekly Newsletter"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-category">Category</Label>
                        <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="announcements">Announcements</SelectItem>
                            <SelectItem value="emergencies">Emergencies</SelectItem>
                            <SelectItem value="prayers">Prayers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-subject">Subject Line</Label>
                        <Input
                          id="template-subject"
                          placeholder="e.g., This Week at Our Church"
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-content">Message Content</Label>
                        <Textarea
                          id="template-content"
                          placeholder="Enter your template message content..."
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveTemplate}
                          disabled={createTemplateMutation.isPending}
                          className="flex-1"
                        >
                          {createTemplateMutation.isPending ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Template'
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowTemplateCreator(false);
                            setNewTemplate({ name: '', subject: '', content: '', category: 'announcements' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {!templates ? (
                    <div className="text-center py-4">
                      <Clock className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Loading templates...</p>
                    </div>
                  ) : Array.isArray(templates) && templates.length > 0 ? (
                    templates.map((template: any) => (
                      <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{template.subject}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-xs hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => useTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-3">
                      {/* Default templates when API fails */}
                      <div className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h4 className="font-medium text-sm">Service Update</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Important Service Information</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-xs hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => useTemplate({
                            id: 'service-update',
                            name: 'Service Update',
                            subject: 'Important Service Information',
                            content: 'Dear Church Family,\n\nWe have an important update regarding our upcoming service. Please see the details below.\n\nBlessings,\nChurch Leadership'
                          })}
                        >
                          Use Template
                        </Button>
                      </div>
                      
                      <div className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h4 className="font-medium text-sm">Weekly Announcement</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Weekly Church News</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-xs hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => useTemplate({
                            id: 'weekly-announcement',
                            name: 'Weekly Announcement',
                            subject: 'Weekly Church News',
                            content: 'Dear Church Family,\n\nHere are this week\'s announcements and upcoming events.\n\nIn His Service,\nChurch Staff'
                          })}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Emergency Broadcast Tab */}
        <TabsContent value="emergency">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="bg-red-50 dark:bg-red-950">
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Shield className="w-5 h-5" />
                Emergency Broadcast System
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                Send urgent messages immediately to all church members across all communication channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Emergency broadcasts are sent immediately to ALL church members via email, push notifications, and in-app messages. Use only for urgent communications.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-title">Emergency Title</Label>
                  <Input
                    id="emergency-title"
                    placeholder="e.g., Service Cancelled Due to Weather"
                    value={emergencyForm.title}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-content">Emergency Message</Label>
                  <Textarea
                    id="emergency-content"
                    placeholder="Provide clear, specific information about the emergency situation..."
                    rows={6}
                    value={emergencyForm.content}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency-response"
                    checked={emergencyForm.requiresResponse}
                    onCheckedChange={(checked) => 
                      setEmergencyForm(prev => ({ ...prev, requiresResponse: checked as boolean }))
                    }
                  />
                  <Label htmlFor="emergency-response">Requires immediate response from recipients</Label>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">This emergency broadcast will:</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Send to ALL church members immediately</li>
                  <li>• Deliver via email, push notifications, and in-app alerts</li>
                  <li>• Display with high priority and urgent styling</li>
                  <li>• Generate delivery confirmation reports</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleEmergencyBroadcast}
                  disabled={emergencyBroadcastMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  {emergencyBroadcastMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Send Emergency Broadcast
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>
                View and track your previous announcements and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">Loading message history...</p>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your sent announcements and messages will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: any) => (
                    <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{message.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant={message.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {message.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {message.sentAt ? 'Sent' : 'Draft'} • {new Date(message.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}