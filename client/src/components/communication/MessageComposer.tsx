import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Send, 
  Users, 
  Mail, 
  Bell, 
  MessageSquare, 
  Target,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import { CommunicationState } from './UnifiedCommunicationHub';
import { useQueryClient } from '@tanstack/react-query';

interface MessageComposerProps {
  state: CommunicationState;
  updateState: (updates: Partial<CommunicationState>) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  onToggleTemplates?: () => void;
  showTemplates?: boolean;
  templates?: any;
  templatesLoading?: boolean;
  onApplyTemplate?: (template: any) => void;
}

export default function MessageComposer({ 
  state, 
  updateState, 
  onSendMessage, 
  isLoading, 
  onToggleTemplates, 
  showTemplates, 
  templates: templatesData, 
  templatesLoading, 
  onApplyTemplate 
}: MessageComposerProps) {
  const queryClient = useQueryClient();
  const { message, templates } = state;
  const [expandedTemplates, setExpandedTemplates] = React.useState<{[key: number]: boolean}>({});
  const [deleteDialog, setDeleteDialog] = React.useState<{open: boolean, template: any | null}>({open: false, template: null});

  const updateMessage = (updates: Partial<typeof message>) => {
    updateState({ message: { ...message, ...updates } });
  };

  const toggleChannel = (channel: string) => {
    const channels = message.channels.includes(channel as any)
      ? message.channels.filter(c => c !== channel)
      : [...message.channels, channel as any];
    updateMessage({ channels });
  };

  const toggleRole = (role: string) => {
    const roles = message.targetAudience.roles.includes(role)
      ? message.targetAudience.roles.filter(r => r !== role)
      : [...message.targetAudience.roles, role];
    updateMessage({ 
      targetAudience: { 
        ...message.targetAudience, 
        roles,
        allMembers: roles.length === 0 
      } 
    });
  };

  const messageTypeIcons = {
    announcement: '📣',
    event: '📅',
    prayer_request: '🙏',
    urgent: '🚨',
    general: '📧'
  };

  return (
    <>
    <Card className="h-fit w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message Builder
            {templates.active && (
              <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                Using: {templates.active.name}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTemplates}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{showTemplates ? 'Hide Templates' : 'Template Library'}</span>
              <span className="sm:hidden">Templates</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateState({ 
                templates: { 
                  ...templates, 
                  creating: !templates.creating 
                },
                ui: {
                  ...state.ui,
                  showTemplates: true
                }
              })}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Library Accordion */}
        {showTemplates && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Template Library</span>
              </div>
              
              {/* Create Template Form */}
              {templates.creating && (
                <div className="p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Create New Template</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="template-name" className="text-xs">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="e.g., Weekly Newsletter"
                          className="h-8 text-sm"
                          value={templates.newTemplate?.name || ''}
                          onChange={(e) => updateState({
                            templates: {
                              ...templates,
                              newTemplate: { ...templates.newTemplate, name: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-category" className="text-xs">Category</Label>
                        <Select 
                          value={templates.newTemplate?.category || 'announcements'}
                          onValueChange={(value) => updateState({
                            templates: {
                              ...templates,
                              newTemplate: { ...templates.newTemplate, category: value }
                            }
                          })}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="announcements">Announcements</SelectItem>
                            <SelectItem value="emergencies">Emergencies</SelectItem>
                            <SelectItem value="prayers">Prayers</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                            <SelectItem value="ministries">Ministries</SelectItem>
                            <SelectItem value="devotional">Devotional</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="outreach">Outreach</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="template-subject" className="text-xs">Subject Line</Label>
                      <Input
                        id="template-subject"
                        placeholder="e.g., This Week at Our Church"
                        className="h-8 text-sm"
                        value={templates.newTemplate?.subject || ''}
                        onChange={(e) => updateState({
                          templates: {
                            ...templates,
                            newTemplate: { ...templates.newTemplate, subject: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-content" className="text-xs">Message Content</Label>
                      <Textarea
                        id="template-content"
                        placeholder="Enter your template message content..."
                        className="min-h-[60px] text-sm"
                        value={templates.newTemplate?.content || ''}
                        onChange={(e) => updateState({
                          templates: {
                            ...templates,
                            newTemplate: { ...templates.newTemplate, content: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateState({ 
                          templates: { 
                            ...templates, 
                            creating: false 
                          } 
                        })}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const newTemplate = templates.newTemplate;
                          
                          if (!newTemplate?.name || !newTemplate?.content) {
                            return;
                          }
                          
                          try {
                            const response = await fetch('/api/communications/templates', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                name: newTemplate.name,
                                category: newTemplate.category || 'announcements',
                                subject: newTemplate.subject || '',
                                content: newTemplate.content
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              
                              updateState({ 
                                templates: { 
                                  ...templates, 
                                  creating: false,
                                  newTemplate: undefined
                                } 
                              });
                              // Refresh templates using React Query
                              await queryClient.invalidateQueries({ queryKey: ['/api/communications/templates'] });
                              // Template saved successfully
                            } else {
                              const error = await response.text();
                              
                              // Failed to save template
                            }
                          } catch (error) {
                            
                            // Error saving template
                          }
                        }}
                      >
                        Save Template
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {templatesLoading ? (
                <div className="text-sm text-muted-foreground">Loading templates...</div>
              ) : (
                <div className="space-y-3">
                  {/* Template Grid - Collapsible */}
                  {templatesData && typeof templatesData === 'object' && [
                    ...(templatesData.announcements || []),
                    ...(templatesData.emergencies || []),
                    ...(templatesData.prayers || []),
                    ...(templatesData.events || []),
                    ...(templatesData.ministries || []),
                    ...(templatesData.devotional || []),
                    ...(templatesData.volunteer || []),
                    ...(templatesData.outreach || []),
                    ...(templatesData.custom || [])
                  ].map((template: any, index: number) => {
                    const expanded = expandedTemplates[index] || false;
                    const setExpanded = (value: boolean) => {
                      setExpandedTemplates(prev => ({ ...prev, [index]: value }));
                    };
                    
                    return (
                      <div key={index} className="border rounded-lg hover:bg-muted/50 transition-colors">
                        {/* Collapsed Header */}
                        <div className="p-3 flex items-center justify-between gap-2">
                          <div 
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => setExpanded(!expanded)}
                          >
                            <span className="font-medium text-sm truncate">{template.name}</span>
                            {template.category && (
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            )}
                            {expanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onApplyTemplate?.(template)}
                              className="shrink-0 min-w-[60px] text-xs"
                            >
                              Use
                            </Button>
                            {template.isCustom && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteDialog({open: true, template})}
                                className="shrink-0 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {expanded && (
                          <div className="px-3 pb-3 pt-0 border-t bg-muted/20">
                            <div className="space-y-2">
                              {template.subject && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Subject:</span> {template.subject}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Content:</span> {template.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {(!templatesData || Object.keys(templatesData).length === 0) && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No templates available. Create your first template using the Create button above.
                    </div>
                  )}
                </div>
              )}
            </div>
            <Separator />
          </>
        )}
        
        {/* Message Type Selector */}
        <div className="space-y-3">
          <Label>Message Type</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(messageTypeIcons).map(([type, icon]) => (
              <Button
                key={type}
                variant={message.type === type ? "default" : "outline"}
                size="sm"
                onClick={() => updateMessage({ type: type as any })}
                className="flex items-center gap-1"
              >
                <span>{icon}</span>
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Title and Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-title">Message Title</Label>
            <Input
              id="message-title"
              placeholder="Enter your message title..."
              value={message.title}
              onChange={(e) => updateMessage({ title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-content">Message Content</Label>
            <Textarea
              id="message-content"
              placeholder="Compose your message here..."
              rows={8}
              value={message.content}
              onChange={(e) => updateMessage({ content: e.target.value })}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {message.content.length} characters
            </div>
          </div>
        </div>

        <Separator />

        {/* Priority and Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select value={message.priority} onValueChange={(value) => updateMessage({ priority: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Response Required</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="requires-response"
                checked={message.requiresResponse}
                onCheckedChange={(checked) => updateMessage({ requiresResponse: checked as boolean })}
              />
              <Label htmlFor="requires-response" className="text-sm">
                Requires response
              </Label>
            </div>
          </div>
        </div>

        {/* Communication Channels */}
        <div className="space-y-3">
          <Label>Delivery Channels</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-email"
                checked={message.channels.includes('email')}
                onCheckedChange={() => toggleChannel('email')}
              />
              <Label htmlFor="channel-email" className="flex items-center gap-1 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-app"
                checked={message.channels.includes('in_app')}
                onCheckedChange={() => toggleChannel('in_app')}
              />
              <Label htmlFor="channel-app" className="flex items-center gap-1 text-sm">
                <Bell className="w-4 h-4" />
                App Notification
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-push"
                checked={message.channels.includes('push')}
                onCheckedChange={() => toggleChannel('push')}
              />
              <Label htmlFor="channel-push" className="flex items-center gap-1 text-sm">
                <Bell className="w-4 h-4" />
                Push Notification
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-sms"
                checked={message.channels.includes('sms')}
                onCheckedChange={() => toggleChannel('sms')}
              />
              <Label htmlFor="channel-sms" className="flex items-center gap-1 text-sm">
                <MessageSquare className="w-4 h-4" />
                SMS
              </Label>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Target Audience
          </Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-members"
              checked={message.targetAudience.allMembers}
              onCheckedChange={(checked) => updateMessage({ 
                targetAudience: { 
                  ...message.targetAudience, 
                  allMembers: checked as boolean,
                  roles: checked ? [] : message.targetAudience.roles
                } 
              })}
            />
            <Label htmlFor="all-members" className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4" />
              All Church Members
            </Label>
          </div>

          {!message.targetAudience.allMembers && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Select specific roles:</Label>
              <div className="grid grid-cols-2 gap-2">
                {['pastor', 'deacon', 'elder', 'volunteer', 'member'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={message.targetAudience.roles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                      {role}s
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Send Button */}
        <Button 
          onClick={onSendMessage}
          disabled={isLoading || !message.title || !message.content}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>



        {/* Message Preview */}
        {(message.title || message.content) && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-2">Preview:</div>
            <div className="space-y-1">
              {message.title && (
                <div className="font-medium text-sm">{message.title}</div>
              )}
              {message.content && (
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {message.content}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({open, template: null})}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Delete Template
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete the template "{deleteDialog.template?.name}"? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800">
              <strong>Warning:</strong> Deleting this template will permanently remove it from your library. 
              Any future communications will no longer have access to this template.
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteDialog({open: false, template: null})}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                const response = await fetch(`/api/communications/templates/${deleteDialog.template?.id}`, {
                  method: 'DELETE',
                  credentials: 'include'
                });
                
                if (response.ok) {
                  await queryClient.invalidateQueries({ queryKey: ['/api/communications/templates'] });
                  setDeleteDialog({open: false, template: null});
                  // Could add a toast notification here instead of alert
                } else {
                  // Failed to delete template
                }
              } catch (error) {
                // Error deleting template
              }
            }}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}