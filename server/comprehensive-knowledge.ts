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
    id: 'pricing-individual-free',
    category: 'pricing',
    subcategory: 'individual',
    keywords: ['free', 'free plan', 'no cost', 'basic features', 'individual free', '250 credits'],
    content: 'FREE Individual Plan (250 credits/month): Includes S.O.A.P. Journal, Prayer Wall Access, Community Discussions, and 500 credits per referral. Perfect for individuals starting their faith journey with SoapBox Super App.',
    helpLink: '/faq#pricing',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'pricing-individual-standard',
    category: 'pricing',
    subcategory: 'individual',
    keywords: ['individual pricing', 'standard plan', '$5', '$5/mo', '500 credits', '$50/year'],
    content: 'Standard Individual Plan: $5/month ($50/year) with 500 credits/month. Includes everything in Basic plus AI-Powered Insights, Priority Support, and 500 credits per referral.',
    helpLink: '/faq#pricing',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'pricing-individual-premium',
    category: 'pricing',
    subcategory: 'individual',
    keywords: ['premium individual', '$10', '$10/mo', 'advanced features', '1000 credits', '$100/year'],
    content: 'Premium Individual Plan: $10/month ($100/year) with 1,000 credits/month. Includes everything in Standard plus Advanced Analytics.',
    helpLink: '/faq#pricing',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'pricing-overview',
    category: 'pricing',
    keywords: ['pricing', 'plans', 'cost', 'how much', 'price', 'subscription', 'plan options'],
    content: 'SoapBox Super App Pricing: FREE (250 credits/month), Standard ($5/month, 500 credits), Premium ($10/month, 1,000 credits). All plans include S.O.A.P. Journal, Prayer Wall, Community Discussions, and 500 referral credits. Higher plans add AI insights, priority support, and advanced analytics.',
    helpLink: '/faq#pricing',
    priority: 10,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'summer-pilot-special',
    category: 'pricing',
    subcategory: 'promotion',
    keywords: ['summer special', 'pilot program', 'free months', 'promotion', 'discount', 'waived fees'],
    content: '🎉 SUMMER PILOT SPECIAL: All fees waived for 6 months for churches signing up during our pilot phase this summer! This is a limited-time offer for early adopters.',
    helpLink: '/faq#pricing',
    priority: 10,
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

  // FREQUENTLY ASKED QUESTIONS
  {
    id: 'mobile-app-availability',
    category: 'technical',
    subcategory: 'mobile',
    keywords: ['mobile app', 'app store', 'google play', 'ios', 'android', 'download'],
    content: 'Mobile App Availability: SoapBox is currently a web application that works perfectly on mobile browsers. Native mobile apps for iOS and Android are planned for future release. The web version is fully optimized for mobile use with all features accessible.',
    helpLink: '/faq#mobile-apps',
    priority: 8,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'offline-functionality',
    category: 'technical',
    subcategory: 'connectivity',
    keywords: ['offline', 'internet', 'connection', 'work without wifi'],
    content: 'Offline Features: Some features like reading past journal entries and saved content work offline. Most interactive features (prayer wall, chat, livestreams, discussions) require an internet connection for real-time updates.',
    helpLink: '/faq#offline-features',
    priority: 7,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'international-access',
    category: 'features',
    subcategory: 'global',
    keywords: ['international', 'global', 'worldwide', 'countries', 'access', 'outside us', 'outside of us', 'outside the us', 'outside america', 'other countries', 'can i use it outside', 'available outside'],
    content: 'International Access: SoapBox is available globally! Anyone with internet access can use SoapBox regardless of their country. Our platform is designed to serve the global Christian community.',
    helpLink: '/faq#international-use',
    priority: 9,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'language-support',
    category: 'features',
    subcategory: 'localization',
    keywords: ['language', 'multilingual', 'spanish', 'other languages', 'translation'],
    content: 'Language Support: Currently, SoapBox is available in English. Multi-language support is on our roadmap. Let us know what language you need and we\'ll prioritize it in our development schedule.',
    helpLink: '/faq#language-support',
    priority: 6,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'church-customization',
    category: 'church',
    subcategory: 'administration',
    keywords: ['customize', 'church settings', 'features toggle', 'permissions', 'roles'],
    content: 'Church Customization: Church administrators can show/hide specific features for different roles (pastor, staff, volunteers, members), create message templates, configure menus, and customize the experience to match your church\'s workflow and preferences.',
    helpLink: '/faq#church-customization',
    priority: 8,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'youth-safety-features',
    category: 'security',
    subcategory: 'youth',
    keywords: ['youth safety', 'children', 'parental controls', 'kids', 'minors'],
    content: 'Youth Safety: SoapBox is safe for children and youth! Youth accounts can be placed in restricted-access groups, monitored by designated staff, and parental controls can be enabled to ensure a safe environment for young users.',
    helpLink: '/faq#youth-safety',
    priority: 9,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'earning-free-credits',
    category: 'features',
    subcategory: 'credits',
    keywords: ['earn credits', 'free credits', 'get more credits', 'bonus credits'],
    content: 'Earning Free Credits: Earn AI credits through engagement: Daily check-ins (+5 credits), Posting prayers or discussions (+3 credits), Responding to prayers (+2 credits), Attending events (+5 credits), Reading daily Bible verses (+2 credits), Referring new users (bonus credits).',
    helpLink: '/faq#earning-free-credits',
    priority: 8,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'vs-social-media',
    category: 'features',
    subcategory: 'comparison',
    keywords: ['different from facebook', 'vs social media', 'why not facebook', 'spiritual focus'],
    content: 'Spiritual Focus vs Social Media: SoapBox centers specifically on faith, prayer, scripture study, and intentional spiritual community — not entertainment or status updates. It\'s designed to support and strengthen your spiritual life rather than distract from it.',
    helpLink: '/faq#vs-social-media',
    priority: 8,
    lastUpdated: '2025-07-18',
    source: 'faq'
  },
  {
    id: 'data-export-options',
    category: 'church',
    subcategory: 'data',
    keywords: ['export data', 'backup', 'download data', 'church records'],
    content: 'Data Export: Churches can export donation records, attendance data, S.O.A.P. journals, user activity logs, and engagement metrics as CSV or PDF files for records, reporting needs, and backup purposes.',
    helpLink: '/faq#data-export',
    priority: 7,
    lastUpdated: '2025-07-18',
    source: 'faq'
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

  // DETAILED FEATURE DESCRIPTIONS
  {
    id: 'credits-system',
    category: 'features',
    subcategory: 'credits',
    keywords: ['credits', 'what are credits', 'credit system', 'how credits work'],
    content: 'Credits power AI-assisted features like sermon generation, biblical research, content creation, and analytics insights. Each plan includes monthly credits. Additional credits can be purchased through boost packs. Credits reset monthly and unused credits don\'t roll over.',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'loyalty-rewards',
    category: 'features',
    subcategory: 'rewards',
    keywords: ['loyalty', 'rewards', 'loyalty credits', 'referral credits', 'bonus credits'],
    content: 'Loyalty Rewards System: Individual plans earn 500 credits per successful referral. Church plans receive 1,000-2,000 loyalty credits every 6 months based on plan level. Use loyalty credits for bonus AI features and premium content.',
    priority: 7,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'demo-scheduling',
    category: 'sales',
    keywords: ['demo', 'schedule demo', 'calendly', 'sales meeting', 'product demonstration'],
    content: 'Schedule a personalized demo at https://www.calendly.com/soapboxsuperapp to see SoapBox Super App in action. Our team will walk you through features, answer questions, and help determine the best plan for your church or personal needs.',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'website'
  },

  // WEBSITE FAQs
  {
    id: 'faq-response-time',
    category: 'support',
    subcategory: 'response-time',
    keywords: ['how quickly', 'response time', 'how fast', 'when will you respond', 'support response'],
    content: 'Response Times: We respond to support emails within 24 hours on weekdays, and sales inquiries within 4 hours during business hours (9am-5pm PT). Live chat is available weekdays 9am–5pm PT.',
    helpLink: '/contact',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'faq-individual-users',
    category: 'general',
    subcategory: 'user-access',
    keywords: ['not church leader', 'individual users', 'personal use', 'regular members', 'non-leader'],
    content: 'Individual Access: Absolutely! SoapBox Super App is designed for all members of faith communities. Individual believers can join prayer circles, participate in Bible studies, and connect with their church community without being a church leader.',
    helpLink: '/contact',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'faq-demos-onboarding',
    category: 'sales',
    subcategory: 'demos',
    keywords: ['live demo', 'onboarding', 'help getting started', 'demo', 'personalized demo'],
    content: 'Live Demos & Onboarding: Yes! We offer personalized live demos via Calendly (https://www.calendly.com/soapboxsuperapp) and comprehensive onboarding support to help your church get started with all features.',
    helpLink: '/contact',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'faq-small-churches',
    category: 'general',
    subcategory: 'church-size',
    keywords: ['small church', 'small congregation', 'suitable for small', 'church size', 'scales'],
    content: 'Small Church Suitability: Perfect for churches of all sizes! Our platform scales from small congregations to mega-churches, with pricing plans designed for every ministry budget. Small churches are especially welcome.',
    helpLink: '/contact',
    priority: 8,
    lastUpdated: '2025-07-17',
    source: 'website'
  },
  {
    id: 'faq-what-makes-different',
    category: 'general',
    subcategory: 'differentiation',
    keywords: ['what makes different', 'compared to other', 'unique features', 'different from other church apps', 'why choose'],
    content: 'What Makes SoapBox Different: SoapBox combines AI-powered pastoral tools, comprehensive community features, and spiritual growth tracking in one integrated platform designed specifically for faith communities. Unlike generic platforms, we\'re built exclusively for churches.',
    helpLink: '/contact',
    priority: 9,
    lastUpdated: '2025-07-17',
    source: 'website'
  },

  // COMPANY INFORMATION
  {
    id: 'company-ownership',
    category: 'company',
    subcategory: 'ownership',
    keywords: ['who owns', 'owner', 'founder', 'ceo', 'leadership', 'alan safahi', 'owns soapbox', 'owns the company', 'company owner', 'soapbox owner'],
    content: 'SoapBox Super App is owned and founded by Alan Safahi, an experienced entrepreneur passionate about strengthening faith communities through technology. Alan leads the vision and development of our comprehensive church management platform.',
    priority: 8,
    lastUpdated: '2025-07-18',
    source: 'company'
  },
  {
    id: 'company-mission',
    category: 'company',
    subcategory: 'mission',
    keywords: ['mission', 'vision', 'purpose', 'why', 'goal', 'about company'],
    content: 'Our mission is to Unite Your Faith Community through innovative technology that strengthens spiritual connections, enhances ministry effectiveness, and builds stronger church communities in the digital age.',
    priority: 8,
    lastUpdated: '2025-07-18',
    source: 'company'
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

  // Check for international access queries specifically
  const internationalKeywords = ['outside us', 'outside of us', 'outside the us', 'outside america', 'international', 'other countries', 'can i use it outside', 'available outside', 'global', 'worldwide'];
  if (internationalKeywords.some(keyword => message.includes(keyword))) {
    const internationalEntry = comprehensiveKnowledge.find(entry => entry.id === 'international-access');
    if (internationalEntry) {
      return {
        found: true,
        answer: internationalEntry.content + "\n\nWhat else would you like to know about SoapBox Super App?",
        helpDocLink: internationalEntry.helpLink,
        confidence: 1.0
      };
    }
  }

  // Advanced keyword matching with scoring
  const matches: Array<{entry: KnowledgeEntry, score: number}> = [];
  
  for (const entry of comprehensiveKnowledge) {
    if (entry.category === 'escalation') continue; // Skip escalation entries in normal search
    
    let score = 0;
    const messageWords = message.split(' ');
    
    // Exact phrase matches (highest priority)
    for (const keyword of entry.keywords) {
      if (message.includes(keyword)) {
        // Give much higher score for longer, more specific phrases
        if (keyword.length > 15) {
          score += 25; // Very specific phrases get highest priority
        } else if (keyword.length > 10) {
          score += 20; // Long phrases like "can i use it outside"
        } else if (keyword.length > 8) {
          score += 15; // High score for specific phrases like "who owns"
        } else if (keyword.length > 5) {
          score += 8;
        } else {
          score += 5;
        }
      }
    }
    
    // Exact word matches (medium priority) - skip common words like "us"
    const skipWords = ['us', 'it', 'is', 'the', 'of', 'to', 'and', 'or', 'in', 'on', 'at', 'by', 'for', 'with', 'can', 'use'];
    for (const word of messageWords) {
      if (word.length > 2 && !skipWords.includes(word)) {
        for (const keyword of entry.keywords) {
          if (keyword === word) {
            score += 3; // Exact word match
          } else if (keyword.includes(word) && word.length > 3) {
            score += 1; // Partial match only for longer words
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
    
    // Generate a relevant follow-up question based on the topic
    let followUpQuestion = "";
    
    if (bestMatch.entry.category === 'company') {
      followUpQuestion = "\n\nWould you like to learn about our pricing plans or schedule a demo?";
    } else if (bestMatch.entry.category === 'pricing') {
      followUpQuestion = "\n\nWould you like to know about specific features included in each plan?";
    } else if (bestMatch.entry.category === 'features') {
      followUpQuestion = "\n\nWould you like help getting started with this feature or have other questions?";
    } else if (bestMatch.entry.category === 'support') {
      followUpQuestion = "\n\nIs there anything else I can help you with today?";
    } else if (bestMatch.entry.category === 'technical') {
      followUpQuestion = "\n\nDo you need help with any other technical issues?";
    } else {
      followUpQuestion = "\n\nWhat else would you like to know about SoapBox Super App?";
    }
    
    return {
      found: true,
      answer: bestMatch.entry.content + followUpQuestion,
      helpDocLink: bestMatch.entry.helpLink,
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