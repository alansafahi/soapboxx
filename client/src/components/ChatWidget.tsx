import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: 'text' | 'system';
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

export default function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [hasProvidedInfo, setHasProvidedInfo] = useState(false);
  const [isBusinessHours, setIsBusinessHours] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownInitialResponse, setHasShownInitialResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chat session and check business hours
  useEffect(() => {
    // Generate or retrieve session ID
    const storedSessionId = localStorage.getItem('chat_session_id');
    const newSessionId = storedSessionId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!storedSessionId) {
      localStorage.setItem('chat_session_id', newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Check business hours
    const checkBusinessHours = () => {
      const now = new Date();
      const ptTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        hour12: false
      });
      const currentHour = parseInt(ptTime.format(now));
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
      setIsBusinessHours(isWeekday && currentHour >= 9 && currentHour < 17);
    };
    
    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load existing conversation when chat opens
  useEffect(() => {
    if (isOpen && sessionId && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, sessionId]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/messages/${sessionId}`);
      
      if (response.ok) {
        const chatMessages = await response.json();
        const formattedMessages = chatMessages.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt),
          type: msg.messageType
        }));
        
        setMessages(formattedMessages);
        
        // If no messages exist, add welcome message
        if (formattedMessages.length === 0) {
          await sendSystemMessage("Hi! I'm here to help you with SoapBox Super App. How can I assist you today?");
        } else {
          // Check if we've already had a conversation
          setHasShownInitialResponse(formattedMessages.length >= 2);
        }
      }
    } catch (error) {
      // If loading fails, show welcome message
      await sendSystemMessage("Hi! I'm here to help you with SoapBox Super App. How can I assist you today?");
    } finally {
      setIsLoading(false);
    }
  };

  const sendSystemMessage = async (text: string) => {
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sender: 'agent',
          content: text,
          messageType: 'system'
        })
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        sender: 'agent',
        timestamp: new Date(),
        type: 'system'
      }]);
    } catch (error) {
      // Fallback to local message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        sender: 'agent',
        timestamp: new Date(),
        type: 'system'
      }]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = async (text: string, sender: 'user' | 'agent', type: 'text' | 'system' = 'text') => {
    try {
      // Save to database
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sender,
          content: text,
          messageType: type
        })
      });
      
      // Add to local state
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
        type
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      // Fallback to local message if API fails
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
        type
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !sessionId) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    await addMessage(userMessage, 'user');

    // If user hasn't provided info yet, ask for it
    if (!hasProvidedInfo && !userInfo.name) {
      setTimeout(async () => {
        await addMessage("I'd love to help you better! Could you please share your name and email?", 'agent', 'system');
      }, 1000);
      return;
    }

    setIsTyping(true);
    
    // Check knowledge base first, then provide intelligent response
    setTimeout(async () => {
      setIsTyping(false);
      
      let response = '';
      const msgLower = userMessage.toLowerCase();
      
      // First check for knowledge base answers
      try {
        const knowledgeResponse = await fetch('/api/chat/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage })
        });
        
        if (knowledgeResponse.ok) {
          const knowledgeData = await knowledgeResponse.json();
          
          if (knowledgeData.found) {
            response = knowledgeData.answer;
            
            // Add help documentation link if available
            if (knowledgeData.helpDocLink) {
              response += `\n\nFor more detailed information, check our [Help Documentation](${knowledgeData.helpDocLink}).`;
            }
            
            // If escalation is needed, add human handoff message
            if (knowledgeData.escalate) {
              response += "\n\nWould you like me to connect you with a team member for further assistance?";
            }
            
            await addMessage(response, 'agent');
            return;
          }
        }
      } catch (error) {
        // Continue with fallback logic if knowledge base fails
      }
      
      // Handle acknowledgments and simple responses
      if (['ok', 'okay', 'thanks', 'thank you', 'got it', 'understood'].includes(msgLower)) {
        if (hasShownInitialResponse) {
          response = "Is there anything else I can help you with today? I can answer questions about:\n• Prayer Wall and prayer requests\n• S.O.A.P. Bible journaling\n• Account setup and login\n• Church events and notifications\n• Giving and donations\n• Technical troubleshooting\n\nOr I can connect you with our support team.";
        } else {
          response = "Great! What specific questions do you have about SoapBox Super App? I can help with features, pricing, demos, or technical support.";
        }
      } else if (msgLower.includes('demo') || msgLower.includes('trial')) {
        response = "I'd be happy to schedule a demo for you! You can book a time that works for you using our Calendly link, or I can connect you with our sales team. Which would you prefer?";
      } else if (msgLower.includes('price') || msgLower.includes('cost')) {
        response = "Our pricing is designed to be affordable for churches of all sizes. For detailed pricing information, I can connect you with our sales team who can provide a customized quote based on your church's needs. Would you like me to arrange that?";
      } else if (msgLower.includes('human') || msgLower.includes('agent') || msgLower.includes('person')) {
        response = isBusinessHours 
          ? "I'll connect you with one of our team members right away. Someone will be with you shortly!"
          : "I'll make sure one of our team members contacts you first thing during business hours (9 AM - 5 PM PT, weekdays). You can also email support@soapboxsuperapp.com for faster response.";
      } else {
        // Only show the business hours message for the first substantial message
        if (!hasShownInitialResponse) {
          response = "I can help answer questions about SoapBox Super App features, account setup, prayer walls, Bible study tools, and technical issues. What would you like to know?";
          setHasShownInitialResponse(true);
        } else {
          // Provide helpful follow-up responses
          response = "I'd be happy to help! I can assist with:\n• Prayer Wall and S.O.A.P. journaling questions\n• Account and login help\n• Church events and notifications\n• Giving and donation setup\n• Technical troubleshooting\n• Demo scheduling and pricing\n\nWhat specific area interests you?";
        }
      }
      
      await addMessage(response, 'agent');
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserInfoSubmit = async () => {
    if (userInfo.name && userInfo.email) {
      try {
        // Save conversation with user data
        await fetch('/api/chat/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userData: {
              name: userInfo.name,
              email: userInfo.email
            }
          })
        });
        
        setHasProvidedInfo(true);
        await addMessage(`Thanks ${userInfo.name}! How can I help you today?`, 'agent', 'system');
        
        toast({
          title: "Chat Started",
          description: "Your conversation is now being saved.",
        });
      } catch (error) {
        setHasProvidedInfo(true);
        await addMessage(`Thanks ${userInfo.name}! How can I help you today?`, 'agent', 'system');
      }
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses} z-50`}>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          {isBusinessHours && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 w-80 sm:w-96 transition-all duration-300 ${isMinimized ? 'h-14' : hasProvidedInfo ? 'h-96' : 'h-[480px]'} max-h-[90vh]`}>
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">SoapBox Support</h3>
              <p className="text-xs opacity-90">
                {isBusinessHours ? "Online now" : "We'll respond soon"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className={`${hasProvidedInfo ? 'h-64' : 'h-48'} overflow-y-auto p-4 space-y-3`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-teal-600 text-white'
                        : message.type === 'system'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* User Info Form (if not provided) */}
            {!hasProvidedInfo && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-2">
                  <Input
                    placeholder="Your name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({...prev, name: e.target.value}))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Your email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({...prev, email: e.target.value}))}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleUserInfoSubmit}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm"
                    disabled={!userInfo.name || !userInfo.email}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            {hasProvidedInfo && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white p-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://wa.me/message/BNZMR2CPIKVKA1', '_blank')}
                    className="text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = 'mailto:support@soapboxsuperapp.com'}
                    className="text-xs flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}