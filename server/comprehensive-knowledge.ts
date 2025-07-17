// Comprehensive SoapBox Super App Knowledge Base
// This system includes all website content, app features, and expandable data sources

export interface KnowledgeEntry {
  id: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  content: string;
  helpLink?: string;
  priority: number; // 1-10, higher = more important
  lastUpdated: string;
  source: 'website' | 'app' | 'support' | 'documentation' | 'communication';
}

export interface KnowledgeResponse {
  found: boolean;
  answer: string;
  helpDocLink?: string;
  relatedTopics?: string[];
  escalate?: boolean;
  confidence: number; // 0-1
}

// Comprehensive Knowledge Base - All SoapBox Super App Content
export const comprehensiveKnowledge: KnowledgeEntry[] = [
  // WEBSITE CONTENT
  {
    id: 'landing-hero',
    category: 'overview',
    keywords: ['what is', 'about', 'soapbox', 'super app', 'faith community', 'unite'],
    content: 'SoapBox Super App is a comprehensive faith-based platform designed to Unite Your Faith Community through advanced prayer networks, AI-powered Bible study tools, seamless event management, and innovative digital ministry solutions. We help churches and believers strengthen their spiritual connections through modern technology.',
    helpLink: '/',
    priority: 10,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'pricing-individual',
    category: 'pricing',
    subcategory: 'individual',
    keywords: ['individual pricing', 'personal plan', 'free', 'premium', 'cost', 'how much', 'price'],
    content: 'Individual Plans: FREE (Basic features including prayer wall, community discussions, basic S.O.A.P. journaling, event viewing). PREMIUM ($4.99/month) includes unlimited prayer circles, advanced Bible study tools, priority support, enhanced analytics, custom prayer reminders, and exclusive content.',
    helpLink: '/pricing',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'pricing-church',
    category: 'pricing',
    subcategory: 'church',
    keywords: ['church pricing', 'congregation', 'ministry', 'church plan', 'organization'],
    content: 'Church Plans: STARTER ($29/month for up to 100 members), GROWTH ($69/month for up to 500 members), ENTERPRISE ($149/month for unlimited members). All church plans include admin dashboard, member management, communication tools, event management, giving platform, sermon studio, and dedicated support.',
    helpLink: '/pricing',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },

  // APP FEATURES - PRAYER SYSTEM
  {
    id: 'prayer-wall-overview',
    category: 'prayer',
    subcategory: 'overview',
    keywords: ['prayer wall', 'prayer requests', 'community prayer', 'intercession'],
    content: 'The Prayer Wall is the heart of spiritual community connection. Submit prayer requests with customizable privacy levels (public, anonymous, private), set expiration dates, attach photos, and receive prayers from your faith community. Track who\'s praying and see prayer counts in real-time.',
    helpLink: '/help-docs#prayer-wall',
    priority: 10,
    lastUpdated: '2025-07-17',
    source: 'app'
  },
  {
    id: 'prayer-submission',
    category: 'prayer',
    subcategory: 'how-to',
    keywords: ['submit prayer', 'create prayer request', 'add prayer', 'prayer form'],
    content: 'To submit a prayer request: 1) Navigate to Prayer Wall, 2) Tap "Add Prayer Request", 3) Write your request (be specific but respectful), 4) Choose privacy level (Public shows your name, Anonymous hides identity, Private is pastor-only), 5) Set expiration if needed, 6) Attach photo if desired, 7) Tap "Submit". Your request will appear immediately.',
    helpLink: '/help-docs#prayer-wall',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'app'
  },
  {
    id: 'prayer-privacy',
    category: 'prayer',
    subcategory: 'privacy',
    keywords: ['prayer privacy', 'anonymous', 'public', 'private', 'confidential'],
    content: 'Prayer Privacy Options: PUBLIC (shows your name and profile, visible to all community members), ANONYMOUS (hides your identity, shows as "Community Member"), PRIVATE (only visible to pastors and church leadership for pastoral care). You can edit privacy settings anytime after posting.',
    helpLink: '/help-docs#prayer-wall',
    priority: 7,
    lastUpdated: '2025-07-17',
    source: 'app'
  },

  // S.O.A.P. JOURNALING SYSTEM
  {
    id: 'soap-overview',
    category: 'bible-study',
    subcategory: 'soap',
    keywords: ['soap', 'bible study', 'journaling', 'scripture', 'devotional', 'reflection'],
    content: 'S.O.A.P. (Scripture, Observation, Application, Prayer) is a powerful Bible study method. Daily readings include guided prompts: Scripture (read the passage), Observation (what stands out?), Application (how does this apply to your life?), Prayer (talk to God about it). Share reflections with community or keep private.',
    helpLink: '/help-docs#soap-journaling',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'app'
  },
  {
    id: 'soap-sharing',
    category: 'bible-study',
    subcategory: 'community',
    keywords: ['share soap', 'community reflections', 'public journal', 'social feed'],
    content: 'Share S.O.A.P. reflections with your community by toggling "Share with Community" when saving. Shared reflections appear in the social feed with purple badges, allowing others to comment, react with "Amen", save to their collection, or reflect (copy to their private journal).',
    helpLink: '/help-docs#soap-journaling',
    priority: 7,
    lastUpdated: '2025-07-17',
    source: 'app'
  },

  // COMMUNICATION & EVENTS
  {
    id: 'events-management',
    category: 'events',
    keywords: ['events', 'calendar', 'rsvp', 'church events', 'activities'],
    content: 'Event Management: View upcoming church events, RSVP with attendance confirmation, add events to personal calendar, receive automated reminders, access event details (location, time, description, special instructions), check-in with QR codes, and track attendance for ministry planning.',
    helpLink: '/help-docs#communication',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'app'
  },
  {
    id: 'communication-hub',
    category: 'communication',
    keywords: ['messages', 'communication', 'announcements', 'notifications'],
    content: 'Communication Hub: Send/receive messages with pastors and staff, participate in small group chats, receive church announcements, manage notification preferences (prayer reminders, event alerts, community updates), set quiet hours for automatic silencing during sleep.',
    helpLink: '/help-docs#communication',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'app'
  },

  // GIVING & DONATIONS
  {
    id: 'giving-system',
    category: 'giving',
    keywords: ['giving', 'donate', 'tithe', 'offering', 'payment', 'contribution'],
    content: 'Secure Online Giving: Give via credit/debit card or bank transfer, set up recurring donations (weekly, monthly, quarterly, annually), view giving history, receive tax receipts automatically each January, designate funds to specific ministries, and track impact with transparency reports.',
    helpLink: '/help-docs#giving-donations',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'app'
  },

  // ADMIN & CHURCH MANAGEMENT
  {
    id: 'admin-dashboard',
    category: 'admin',
    keywords: ['admin', 'dashboard', 'church management', 'member management'],
    content: 'Admin Dashboard: Manage church members, view engagement analytics, create/manage events, send announcements, access giving reports, configure church features, manage QR codes for check-ins, moderate prayer requests, and export data for ministry planning.',
    helpLink: '/help-docs#admin-dashboard',
    priority: 6,
    lastUpdated: '2025-07-17',
    source: 'app'
  },

  // AI FEATURES
  {
    id: 'ai-sermon-studio',
    category: 'ai-tools',
    subcategory: 'sermon',
    keywords: ['sermon studio', 'ai sermon', 'preaching', 'biblical research'],
    content: 'AI Sermon Studio: Get biblical research assistance, generate sermon outlines, access illustration libraries with relevance scoring, enhance content for theological accuracy, and create multi-platform content (social posts, newsletters, study guides) from your sermons.',
    priority: 7,
    lastUpdated: '2025-07-17',
    source: 'app'
  },

  // TECHNICAL SUPPORT
  {
    id: 'login-issues',
    category: 'technical',
    subcategory: 'authentication',
    keywords: ['login', 'password', 'forgot password', 'account access', 'sign in'],
    content: 'Login Issues: If you can\'t log in: 1) Verify email and password are correct, 2) Check caps lock is off, 3) Use "Forgot Password" to reset, 4) Clear browser cache or app cache, 5) Try different device/browser, 6) Contact support if issues persist. Account recovery available.',
    helpLink: '/help-docs#account-management',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'support'
  },
  {
    id: 'app-performance',
    category: 'technical',
    subcategory: 'performance',
    keywords: ['slow', 'loading', 'performance', 'lag', 'freeze', 'crash'],
    content: 'Performance Issues: For slow performance: 1) Close other apps, 2) Ensure sufficient storage space, 3) Update to latest app version, 4) Restart device, 5) Check internet connection speed, 6) Clear app cache, 7) Reinstall if problems persist. Contact support for persistent issues.',
    helpLink: '/help-docs#mobile-troubleshooting',
    priority: 7,
    lastUpdated: '2025-07-17',
    source: 'support'
  },

  // CONTACT & SUPPORT
  {
    id: 'contact-info',
    category: 'support',
    keywords: ['contact', 'support', 'help', 'phone', 'email', 'address'],
    content: 'Contact Information: Email: support@soapboxsuperapp.com, Phone: (805) 342-2940, Address: 1130 E. Clark Street, #150-204, Orcutt, CA 93455. Business Hours: 9 AM - 5 PM PT, weekdays. For urgent issues, email provides fastest response. Live chat available during business hours.',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },

  // ESCALATION TRIGGERS
  {
    id: 'billing-escalation',
    category: 'escalation',
    keywords: ['billing', 'refund', 'cancel', 'subscription', 'payment issues', 'delete account'],
    content: 'ESCALATE: Billing, subscription, refund, account deletion, and payment issues require human support for security and privacy compliance.',
    priority: 10,
    lastUpdated: '2025-07-17',
    source: 'support'
  }
];

// Advanced search function with semantic matching and confidence scoring
export function searchComprehensiveKnowledge(userMessage: string): KnowledgeResponse {
  const message = userMessage.toLowerCase().trim();
  
  // Handle simple acknowledgments
  const acknowledgments = ['ok', 'okay', 'thanks', 'thank you', 'got it', 'understood', 'yes', 'sure'];
  if (acknowledgments.includes(message)) {
    return {
      found: true,
      answer: "What would you like to know about SoapBox Super App? I can help with:\n\n🙏 **Prayer & Spiritual Life**\n• Prayer wall and requests\n• S.O.A.P. Bible journaling\n• Daily devotionals\n\n⛪ **Church Features**\n• Events and calendar\n• Giving and donations\n• Communication tools\n\n💡 **AI-Powered Tools**\n• Sermon studio\n• Biblical research\n• Content creation\n\n📱 **Account & Technical**\n• Login and setup\n• App troubleshooting\n• Pricing and plans\n\nWhat specific area interests you?",
      confidence: 1.0
    };
  }

  // Check for escalation first
  const escalationEntry = comprehensiveKnowledge.find(entry => entry.id === 'billing-escalation');
  const escalateKeywords = ['billing', 'refund', 'cancel', 'delete account', 'payment issues'];
  
  if (escalateKeywords.some(keyword => message.includes(keyword)) || 
      (message.includes('cancel') && message.includes('subscription'))) {
    return {
      found: true,
      answer: "I'll connect you with our support team for assistance with account and billing matters. They'll be able to help you directly with this request for security and privacy compliance.",
      escalate: true,
      confidence: 1.0
    };
  }

  // Advanced keyword matching with scoring
  const matches: Array<{entry: KnowledgeEntry, score: number}> = [];
  
  for (const entry of comprehensiveKnowledge) {
    if (entry.category === 'escalation') continue; // Skip escalation entries in normal search
    
    let score = 0;
    const messageWords = message.split(' ');
    
    // Exact keyword matches (highest score)
    for (const keyword of entry.keywords) {
      if (message.includes(keyword)) {
        score += keyword.length > 3 ? 3 : 2; // Longer keywords get higher scores
      }
    }
    
    // Partial word matches
    for (const word of messageWords) {
      if (word.length > 3) {
        for (const keyword of entry.keywords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 1;
          }
        }
      }
    }
    
    // Category boost for relevant topics
    if (message.includes(entry.category)) score += 2;
    if (entry.subcategory && message.includes(entry.subcategory)) score += 2;
    
    // Priority boost
    score += entry.priority * 0.1;
    
    if (score > 0) {
      matches.push({ entry, score });
    }
  }
  
  // Sort by score and get best match
  matches.sort((a, b) => b.score - a.score);
  
  if (matches.length > 0) {
    const bestMatch = matches[0];
    const confidence = Math.min(bestMatch.score / 10, 1.0); // Normalize to 0-1
    
    // Generate related topics from other high-scoring matches
    const relatedTopics = matches
      .slice(1, 4)
      .filter(match => match.score > 1)
      .map(match => match.entry.category)
      .filter((category, index, arr) => arr.indexOf(category) === index);
    
    return {
      found: true,
      answer: bestMatch.entry.content,
      helpDocLink: bestMatch.entry.helpLink,
      relatedTopics,
      confidence
    };
  }
  
  // Fallback for unmatched queries
  return {
    found: false,
    answer: "",
    confidence: 0.0
  };
}

// Function to add new knowledge entries (for daily growth)
export function addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'lastUpdated'>): KnowledgeEntry {
  const newEntry: KnowledgeEntry = {
    ...entry,
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  
  comprehensiveKnowledge.push(newEntry);
  return newEntry;
}

// Function to update existing knowledge
export function updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): boolean {
  const index = comprehensiveKnowledge.findIndex(entry => entry.id === id);
  if (index !== -1) {
    comprehensiveKnowledge[index] = {
      ...comprehensiveKnowledge[index],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    return true;
  }
  return false;
}

// Enhanced greeting responses
export function getEnhancedGreetingResponse(message: string): string | null {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const msg = message.toLowerCase();
  
  if (greetings.some(greeting => msg.includes(greeting))) {
    return "Hello! I'm your SoapBox Super App expert assistant. I have comprehensive knowledge about our faith-based platform, including all features, pricing, technical support, and ministry tools. What would you like to learn about?";
  }
  
  return null;
}