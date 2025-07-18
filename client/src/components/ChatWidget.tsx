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

  // Load existing conversation when chat opens and check for saved user info
  useEffect(() => {
    if (isOpen && sessionId && messages.length === 0) {
      // Check for saved user info
      const savedUserInfo = localStorage.getItem('chat_user_info');
      if (savedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(savedUserInfo);
          setUserInfo(parsedUserInfo);
          setHasProvidedInfo(true);
        } catch (error) {
          // Ignore invalid saved data
        }
      }
      
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
              response += `\n\nFor more details: [View Help Documentation](${knowledgeData.helpDocLink})`;
            }
            
            // Add related topics if available
            if (knowledgeData.relatedTopics && knowledgeData.relatedTopics.length > 0) {
              response += `\n\n**Related topics:** ${knowledgeData.relatedTopics.join(', ')}`;
            }
            
            // If escalation is needed, add human handoff message
            if (knowledgeData.escalate) {
              response += "\n\n🔄 **Connecting you with our support team for personalized assistance...**";
            }
            
            // Add confidence indicator for high-quality responses
            if (knowledgeData.confidence && knowledgeData.confidence > 0.8) {
              // High confidence responses get a checkmark
              response = "✅ " + response;
            }
            
            await addMessage(response, 'agent');
            return;
          }
        }
      } catch (error) {
        // Continue with fallback logic if knowledge base fails
      }
      
      // Enhanced fallback with GPT-4o integration for complex queries
      try {
        const gptResponse = await fetch('/api/chat/gpt-fallback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessage,
            context: 'SoapBox Super App support chat' 
          })
        });
        
        if (gptResponse.ok) {
          const gptData = await gptResponse.json();
          if (gptData.response) {
            response = gptData.response;
            await addMessage(response, 'agent');
            return;
          }
        }
      } catch (error) {
        // Continue with static fallbacks if GPT fails
      }
      
      // Static fallback responses for key topics
      if (msgLower.includes('demo') || msgLower.includes('trial')) {
        response = "I'd be happy to schedule a demo for you! You can book a time that works for you using our Calendly link, or I can connect you with our sales team. Which would you prefer?";
      } else if (msgLower.includes('price') || msgLower.includes('cost') || msgLower.includes('how much')) {
        response = "SoapBox Super App pricing:\n• FREE (100 credits/month) - S.O.A.P. Journal, Prayer Wall, Community\n• Standard ($10/month, 500 credits) - Adds AI insights, priority support\n• Premium ($20/month, 1,000 credits) - Advanced analytics\n\nWould you like details on individual or church pricing?";
      } else if (msgLower.includes('human') || msgLower.includes('agent') || msgLower.includes('person')) {
        response = isBusinessHours 
          ? "I'll connect you with one of our team members right away. Someone will be with you shortly!"
          : "I'll make sure one of our team members contacts you first thing during business hours (9 AM - 5 PM PT, weekdays). You can also email support@soapboxsuperapp.com for faster response.";
      } else {
        // Intelligent follow-up based on conversation state
        if (!hasShownInitialResponse) {
          response = "I'm your SoapBox Super App assistant with access to comprehensive knowledge about our faith-based platform. I can help with features, pricing, technical support, and ministry tools. What would you like to know?";
          setHasShownInitialResponse(true);
        } else {
          // Smart suggestions based on common queries
          response = "I have detailed knowledge about:\n• Prayer Wall and S.O.A.P. journaling\n• Account setup and troubleshooting\n• Church events and community features\n• Giving and donation options\n• Pricing plans and features\n• AI-powered ministry tools\n\nWhat interests you most?";
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
        
        // Save user info to localStorage for future sessions
        localStorage.setItem('chat_user_info', JSON.stringify({
          name: userInfo.name,
          email: userInfo.email
        }));
        
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

  // Positioning styles - use inline styles for reliable fixed positioning
  const widgetStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: position === 'bottom-right' ? '20px' : 'auto',
    left: position === 'bottom-left' ? '20px' : 'auto',
    zIndex: 99999,
  };

  if (!isOpen) {
    return (
      <div className="chat-widget-isolation" style={widgetStyles}>
        <div className="relative chat-widget-isolation">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              setIsOpen(true);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              setIsOpen(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation chat-widget-isolation"
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
    <div className="chat-widget-isolation" style={widgetStyles}>
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 w-80 sm:w-96 transition-all duration-300 ${isMinimized ? 'h-14' : hasProvidedInfo ? 'h-96' : 'h-[480px]'} max-h-[90vh] touch-manipulation chat-widget-isolation`}
           onTouchStart={(e) => { 
             e.stopPropagation(); 
             if (e.stopImmediatePropagation) e.stopImmediatePropagation(); 
           }}
           onTouchEnd={(e) => { 
             e.stopPropagation(); 
             if (e.stopImmediatePropagation) e.stopImmediatePropagation(); 
           }}
           onClick={(e) => { 
             e.stopPropagation(); 
             if (e.stopImmediatePropagation) e.stopImmediatePropagation(); 
           }}>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-white hover:bg-white/20 p-1 touch-manipulation"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-white hover:bg-white/20 p-1 touch-manipulation"
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUserInfoSubmit();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUserInfoSubmit();
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm touch-manipulation"
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }}
                    disabled={!currentMessage.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white p-2 touch-manipulation"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick Actions - Fixed styling */}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://wa.me/message/BNZMR2CPIKVKA1', '_blank')}
                    className="text-xs flex items-center gap-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Phone className="w-3 h-3" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = 'mailto:support@soapboxsuperapp.com'}
                    className="text-xs flex items-center gap-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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