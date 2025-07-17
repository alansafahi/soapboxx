// Chat Knowledge Base Integration
// This module provides intelligent responses based on our help documentation

export interface KnowledgeResponse {
  found: boolean;
  answer: string;
  helpDocLink?: string;
  escalate?: boolean;
}

// Help documentation knowledge base - extracted from help-docs.tsx
const helpKnowledge = {
  // Getting Started
  "account": {
    keywords: ["account", "sign up", "register", "login", "password", "profile"],
    answers: {
      "create account": "To create your account: 1) Download SoapBox Super App from your app store, 2) Tap 'Sign Up' on the welcome screen, 3) Enter your email and create a password, 4) Verify your email, 5) Complete your profile with name and church affiliation.",
      "login issues": "If you can't log in: 1) Check your email and password are correct, 2) Ensure caps lock is off, 3) Try 'Forgot Password' to reset, 4) Clear app cache if on mobile, 5) Contact support if issues persist.",
      "profile setup": "Complete your profile by adding: your full name, profile photo, church affiliation, prayer preferences, and notification settings. This helps personalize your SoapBox experience."
    },
    helpLink: "/help-docs#getting-started"
  },

  // Prayer Wall
  "prayer": {
    keywords: ["prayer", "pray", "prayer wall", "prayer request", "praying"],
    answers: {
      "prayer request": "To submit a prayer request: 1) Go to Prayer Wall, 2) Tap 'Add Prayer Request', 3) Write your request, 4) Choose privacy level (public/anonymous/private), 5) Set expiration if needed, 6) Tap 'Submit'.",
      "pray for others": "To pray for others: Browse the Prayer Wall, tap 'I'm Praying' on requests that move you, add encouraging comments, and join group prayer circles for deeper fellowship.",
      "privacy": "Prayer privacy options: Public (shows your name), Anonymous (hides your identity), Private (only you and pastors see). You can edit privacy anytime."
    },
    helpLink: "/help-docs#prayer-wall"
  },

  // S.O.A.P. Journaling
  "soap": {
    keywords: ["soap", "journal", "bible study", "scripture", "devotional"],
    answers: {
      "soap method": "S.O.A.P. stands for: Scripture (read the passage), Observation (what stands out?), Application (how does this apply to your life?), Prayer (talk to God about it). It's a powerful way to study the Bible.",
      "daily devotional": "Access daily devotionals in the S.O.A.P. Journal section. Each day features a new scripture with guided reflection prompts to deepen your faith journey.",
      "sharing reflections": "You can share your S.O.A.P. reflections with your church community by toggling 'Share with Community' when saving your entry."
    },
    helpLink: "/help-docs#soap-journaling"
  },

  // Communication & Events
  "communication": {
    keywords: ["message", "notification", "announcement", "event", "calendar"],
    answers: {
      "notifications": "Manage notifications in Settings > Notifications. You can control prayer reminders, event alerts, community updates, and quiet hours (automatically silenced during sleep time).",
      "church events": "View upcoming events in the Events section. RSVP to events, add to your calendar, and receive reminders. Event details include location, time, and special instructions.",
      "messaging": "Send messages through the Communication Hub. Reach out to pastors, join small group chats, or participate in church-wide discussions."
    },
    helpLink: "/help-docs#communication"
  },

  // Giving & Donations
  "giving": {
    keywords: ["donate", "giving", "tithe", "offering", "payment"],
    answers: {
      "online giving": "Give securely through the Giving section: 1) Choose amount, 2) Select one-time or recurring, 3) Enter payment method, 4) Review and confirm. All transactions are encrypted and secure.",
      "recurring donations": "Set up recurring donations for consistent giving. Choose weekly, monthly, or custom intervals. You can modify or cancel anytime in your giving history.",
      "tax receipts": "Annual giving statements are automatically generated each January. Access them in Giving > Tax Documents for easy tax preparation."
    },
    helpLink: "/help-docs#giving-donations"
  },

  // Technical Issues
  "technical": {
    keywords: ["technical", "bug", "error", "crash", "sync", "loading", "slow"],
    answers: {
      "app crashes": "If the app crashes: 1) Close and restart the app, 2) Check for app updates, 3) Restart your device, 4) Clear app cache, 5) Reinstall if problems persist.",
      "sync issues": "For sync problems: Ensure strong internet connection, check if signed into correct account, manually refresh by pulling down on main screens, or log out and back in.",
      "slow performance": "To improve performance: Close other apps, ensure sufficient storage space, update to latest app version, restart device, or check internet connection speed."
    },
    helpLink: "/help-docs#mobile-troubleshooting"
  }
};

export function searchKnowledge(userMessage: string): KnowledgeResponse {
  const message = userMessage.toLowerCase();
  
  // Check each knowledge category
  for (const [category, data] of Object.entries(helpKnowledge)) {
    // Check if message contains category keywords
    if (data.keywords.some(keyword => message.includes(keyword))) {
      
      // Find specific answer within category
      for (const [topic, answer] of Object.entries(data.answers)) {
        const topicWords = topic.split(' ');
        if (topicWords.every(word => message.includes(word)) || 
            topicWords.some(word => message.includes(word))) {
          return {
            found: true,
            answer: answer,
            helpDocLink: data.helpLink
          };
        }
      }
      
      // If category matches but no specific topic, return general category response
      const firstAnswer = Object.values(data.answers)[0];
      return {
        found: true,
        answer: firstAnswer,
        helpDocLink: data.helpLink
      };
    }
  }

  // Check for common questions that should escalate immediately
  const escalateKeywords = ['billing', 'refund', 'cancel subscription', 'delete account', 'data export'];
  if (escalateKeywords.some(keyword => message.includes(keyword))) {
    return {
      found: true,
      answer: "I'll connect you with our support team for assistance with account and billing matters. They'll be able to help you directly with this request.",
      escalate: true
    };
  }

  // No knowledge base match found
  return {
    found: false,
    answer: ""
  };
}

// Common greeting responses
export function getGreetingResponse(message: string): string | null {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const msg = message.toLowerCase();
  
  if (greetings.some(greeting => msg.includes(greeting))) {
    return "Hello! I'm here to help you with SoapBox Super App. I can answer questions about prayer walls, Bible study tools, giving, events, account setup, and technical issues. What would you like to know?";
  }
  
  return null;
}