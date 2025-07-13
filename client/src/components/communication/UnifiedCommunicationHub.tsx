import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import MessageComposer from './MessageComposer';
import TemplateLibrary from './TemplateLibrary';
import EmergencyBroadcast from './EmergencyBroadcast';
import MessageHistory from './MessageHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, Zap, History, Send } from 'lucide-react';

export interface CommunicationState {
  message: {
    title: string;
    content: string;
    type: 'announcement' | 'prayer_request' | 'event' | 'urgent' | 'general';
    channels: ('email' | 'push' | 'sms' | 'in_app')[];
    targetAudience: {
      allMembers: boolean;
      roles: string[];
      departments: string[];
      customList?: string[];
    };
    priority: 'low' | 'normal' | 'high' | 'urgent';
    requiresResponse: boolean;
  };
  templates: {
    active: any | null;
    preview: any | null;
    creating: boolean;
    editing: any | null;
    filter: string;
    searchTerm: string;
  };
  ui: {
    activePanel: 'compose' | 'templates';
    showPreview: boolean;
    suggestions: any[];
    showTemplates: boolean;
  };
}

export default function UnifiedCommunicationHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [communicationState, setCommunicationState] = useState<CommunicationState>({
    message: {
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
    },
    templates: {
      active: null,
      preview: null,
      creating: false,
      editing: null,
      filter: 'all',
      searchTerm: ''
    },
    ui: {
      activePanel: 'compose',
      showPreview: false,
      suggestions: [],
      showTemplates: false
    }
  });

  // Update communication state helper
  const updateState = useCallback((updates: Partial<CommunicationState>) => {
    setCommunicationState(prev => ({
      ...prev,
      ...updates,
      message: { ...prev.message, ...(updates.message || {}) },
      templates: { ...prev.templates, ...(updates.templates || {}) },
      ui: { ...prev.ui, ...(updates.ui || {}) }
    }));
  }, []);

  // Fetch message templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/communications/templates'],
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch message history
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/communications/messages'],
    retry: 1
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communications/messages', data),
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "Your announcement has been delivered to the selected recipients."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/messages'] });
      // Reset message form
      updateState({
        message: {
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
        }
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  // Apply template to message
  const applyTemplate = useCallback((template: any) => {
    updateState({
      message: {
        ...communicationState.message,
        title: template.subject || template.name,
        content: template.content,
        type: template.id?.includes('emergency') || template.id?.includes('urgent') ? 'urgent' : 'announcement'
      },
      templates: {
        ...communicationState.templates,
        active: template
      }
    });
    
    toast({
      title: "Template Applied",
      description: `"${template.name}" template has been loaded into the message form.`
    });
  }, [communicationState, updateState]);

  // Send message handler
  const handleSendMessage = () => {
    if (!communicationState.message.title || !communicationState.message.content) {
      toast({
        title: "Missing required fields",
        description: "Please enter both a title and content for your message.",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate(communicationState.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Communication Hub</h1>
          <p className="text-muted-foreground">
            Streamlined messaging for your church community
          </p>
        </div>
      </div>

      <Tabs defaultValue="unified" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified" className="flex items-center gap-1 text-xs sm:text-sm">
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">Compose</span>
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-1 text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Emergency Broadcast</span>
            <span className="sm:hidden">Emergency</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm">
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Message History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-6">
          <MessageComposer
            state={communicationState}
            updateState={updateState}
            onSendMessage={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
            onToggleTemplates={() => updateState({ 
              ui: { 
                ...communicationState.ui, 
                showTemplates: !communicationState.ui.showTemplates 
              } 
            })}
            showTemplates={communicationState.ui.showTemplates}
            templates={templates}
            templatesLoading={templatesLoading}
            onApplyTemplate={applyTemplate}
          />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyBroadcast />
        </TabsContent>

        <TabsContent value="history">
          <MessageHistory messages={messages} isLoading={messagesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}