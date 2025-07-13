import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Send, 
  Users, 
  Mail, 
  Bell, 
  MessageSquare, 
  Target,
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { CommunicationState } from './UnifiedCommunicationHub';

interface MessageComposerProps {
  state: CommunicationState;
  updateState: (updates: Partial<CommunicationState>) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
}

export default function MessageComposer({ state, updateState, onSendMessage, isLoading }: MessageComposerProps) {
  const { message, templates } = state;

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
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Message Builder
          {templates.active && (
            <Badge variant="outline" className="ml-auto">
              Using: {templates.active.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
  );
}