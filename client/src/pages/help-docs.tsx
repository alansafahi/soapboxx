import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Search, MessageCircle, Mail, BookOpen, Users, Settings, Heart, Calendar, DollarSign, Smartphone, Shield, ChevronRight, HelpCircle } from "lucide-react";

// Custom Spiritual Icons
const CrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2V8H4V10H10V22H14V10H20V8H14V2H10Z"/>
  </svg>
);

const PrayingHandsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8.5C11.3 8.5 10.8 9 10.8 9.6V17.4C10.8 18 11.3 18.5 12 18.5C12.7 18.5 13.2 18 13.2 17.4V9.6C13.2 9 12.7 8.5 12 8.5Z"/>
    <path d="M9 7C8.4 7 8 7.4 8 8V16C8 16.6 8.4 17 9 17C9.6 17 10 16.6 10 16V8C10 7.4 9.6 7 9 7Z"/>
    <path d="M15 7C14.4 7 14 7.4 14 8V16C14 16.6 14.4 17 15 17C15.6 17 16 16.6 16 16V8C16 7.4 15.6 7 15 7Z"/>
    <path d="M6 9C5.4 9 5 9.4 5 10V14C5 14.6 5.4 15 6 15C6.6 15 7 14.6 7 14V10C7 9.4 6.6 9 6 9Z"/>
    <path d="M18 9C17.4 9 17 9.4 17 10V14C17 14.6 17.4 15 18 15C18.6 15 19 14.6 19 14V10C19 9.4 18.6 9 18 9Z"/>
  </svg>
);

const SoapIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C8.1 3 5 6.1 5 10C5 13.9 8.1 17 12 17C15.9 17 19 13.9 19 10C19 6.1 15.9 3 12 3ZM12 15C9.2 15 7 12.8 7 10C7 7.2 9.2 5 12 5C14.8 5 17 7.2 17 10C17 12.8 14.8 15 12 15Z"/>
    <path d="M12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z"/>
    <path d="M8 19H16C17.1 19 18 19.9 18 21H6C6 19.9 6.9 19 8 19Z"/>
  </svg>
);

interface HelpArticle {
  title: string;
  content: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  articles: HelpArticle[];
}

export default function HelpDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  // Set SEO meta tags
  useEffect(() => {
    document.title = "Help Documentation | SoapBox Super App Support Center";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find answers to your SoapBox Super App questions. Complete help documentation covering getting started, prayer walls, S.O.A.P. journaling, church management, and troubleshooting guides.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Find answers to your SoapBox Super App questions. Complete help documentation covering getting started, prayer walls, S.O.A.P. journaling, church management, and troubleshooting guides.';
      document.head.appendChild(meta);
    }
  }, []);

  const helpCategories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      articles: [
        {
          title: "What is SoapBox Super App?",
          content: "SoapBox Super App is a comprehensive faith-based platform designed to unite church communities through prayer, Bible study, events, and digital ministry tools. Our AI-powered features help pastors create sermons, manage communications, and track community engagement."
        },
        {
          title: "How to Create a Church or Join One",
          content: "To create a church: Go to Church Discovery → Create New Church → Fill in details like name, denomination, and address. To join: Search for your church by name or denomination → Click 'Connect' → Wait for approval from church administrators."
        },
        {
          title: "Roles: Member, Pastor, Admin, Owner Explained",
          content: "• Member: Basic access to prayer wall, events, S.O.A.P. journaling\n• Pastor: Can create sermons, manage communications, moderate content\n• Admin: Full church management, member oversight, analytics access\n• SoapBox Owner: Platform-wide administrative privileges"
        },
        {
          title: "How to Invite Church Members",
          content: "Church administrators can invite members via: Admin Portal → Member Directory → Invite Members → Enter email addresses → Send invitations. Members receive email invitations with setup instructions."
        },
        {
          title: "Supported Devices & System Requirements",
          content: "SoapBox works on: Desktop browsers (Chrome, Firefox, Safari, Edge), Mobile devices (iOS 13+, Android 8+), Tablets. Requires internet connection for real-time features like prayer walls and live communications."
        }
      ]
    },
    {
      id: "account-profile",
      title: "Account & Profile Management",
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      articles: [
        {
          title: "How to Sign Up or Log In",
          content: "Visit soapboxsuperapp.com → Click 'Sign In' → Create account with email/password or use social login (Google, Facebook, Apple). First-time users complete profile setup including name, phone, and church affiliation."
        },
        {
          title: "Resetting Your Password",
          content: "On login page → Click 'Forgot Password' → Enter your email → Check inbox for reset link → Follow instructions to create new password. Password must be at least 8 characters with mix of letters and numbers."
        },
        {
          title: "Updating Your Email, Phone, or Profile Info",
          content: "Go to Profile → Settings → Personal Information → Update fields → Save changes. Email changes require verification. Profile pictures can be uploaded (max 5MB, JPG/PNG formats)."
        },
        {
          title: "Managing Notifications (Email, Push, In-App)",
          content: "Settings → Notifications → Toggle preferences for: Prayer requests, Church announcements, S.O.A.P. reminders, Event notifications. Set quiet hours to avoid notifications during sleep."
        },
        {
          title: "Deleting or Deactivating Your Account",
          content: "Settings → Privacy → Account Management → Delete Account. This permanently removes all your data including prayer requests, S.O.A.P. entries, and church connections. Action cannot be undone."
        }
      ]
    },
    {
      id: "prayer-wall",
      title: "Prayer Wall",
      icon: <PrayingHandsIcon className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      articles: [
        {
          title: "How to Post a Prayer Request",
          content: "Prayer Wall → 'Add Prayer Request' → Write your request → Choose privacy (Public/Anonymous/Private) → Set expiration (optional) → Post. Public requests appear to all church members, Anonymous shows 'Community Member', Private only visible to you."
        },
        {
          title: "Managing Prayer Comments and Replies",
          content: "Click on any prayer request to view comments → Add your prayer or encouragement → Tag others with @ symbol → Edit/delete your own comments. Inappropriate content can be reported to church administrators."
        },
        {
          title: "Privacy Settings for Prayer Posts",
          content: "Three privacy levels: 1) Public (shows your name), 2) Anonymous (shows 'Community Member'), 3) Private (only you can see). You can edit privacy settings after posting by clicking the edit button."
        },
        {
          title: "How the Prayer Wall Works",
          content: "The Prayer Wall is a sacred space for community support. Requests are sorted by urgency and recency. Members can 'pray for' requests (adds to prayer count), comment with encouragement, and bookmark for follow-up prayers."
        },
        {
          title: "Can I Post Without Being in a Church?",
          content: "Yes! Independent prayer circles allow non-church members to create up to 2 private prayer groups. However, joining a church provides access to larger community support and additional features."
        }
      ]
    },
    {
      id: "soap-journaling",
      title: "S.O.A.P. Journaling",
      icon: <SoapIcon className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
      articles: [
        {
          title: "What Is S.O.A.P. and How to Use It",
          content: "S.O.A.P. stands for Scripture, Observation, Application, Prayer. Daily Bible reading method: 1) Read the Scripture, 2) Write what you Observed, 3) Note how to Apply it, 4) Write a Prayer response. Our AI suggests relevant scriptures and helps guide reflections."
        },
        {
          title: "Setting Up Daily Reminders",
          content: "S.O.A.P. Journal → Settings → Daily Reminders → Choose time and frequency → Enable notifications. Customize reminder message and set preferred Bible translation (KJV, NIV, ESV available)."
        },
        {
          title: "Sharing or Keeping Journals Private",
          content: "Each S.O.A.P. entry can be: Private (personal reflection), Shared with Church (community learning), or Public (inspiration for others). Toggle visibility when creating or editing entries."
        },
        {
          title: "Mood Tags Explained",
          content: "Mood tags help track your spiritual journey: Joyful, Grateful, Peaceful, Struggling, Hopeful, etc. Our AI suggests moods based on your reflection content. Use analytics to see patterns in your spiritual growth over time."
        }
      ]
    },
    {
      id: "communication",
      title: "Communication Hub",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-teal-500 to-teal-600",
      articles: [
        {
          title: "Creating and Sending Announcements",
          content: "Admin Portal → Communication Hub → Compose Message → Choose type (Announcement, Urgent, Event, Prayer) → Write content → Select recipients → Send or Schedule. Messages appear in member feeds and trigger notifications."
        },
        {
          title: "Using Templates for Church Updates",
          content: "Save time with templates: Weekly Updates, Event Announcements, Prayer Requests, Holiday Messages. Create custom templates or use AI-suggested content based on message type and church calendar."
        },
        {
          title: "Scheduling Communications",
          content: "Compose message → Schedule for later → Pick date/time → Confirm. Great for Sunday morning reminders, holiday greetings, or event announcements. View scheduled messages in Message History."
        },
        {
          title: "Push vs In-App Messaging",
          content: "Push notifications appear on device lock screen for urgent messages. In-app messages show in the notification center within SoapBox. Members can customize preferences for each message type."
        }
      ]
    },
    {
      id: "giving",
      title: "Giving & Donations",
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-emerald-500 to-emerald-600",
      articles: [
        {
          title: "How to Set Up Giving",
          content: "Giving → Set Amount → Choose frequency (One-time, Weekly, Monthly) → Add payment method → Confirm donation. Secure processing through Stripe with receipt emailed automatically."
        },
        {
          title: "Tracking Donations and History",
          content: "Profile → Giving History → View all donations, download receipts, update payment methods. Annual giving statements available for tax purposes each January."
        },
        {
          title: "Giving Analytics Overview",
          content: "Church administrators can view: Total donations, donor counts, giving trends, campaign progress. Individual donor information remains private - only aggregate data is shown."
        },
        {
          title: "Integrating with Stripe or Other Providers",
          content: "Admin Portal → Settings → Payment Processing → Connect Stripe account → Configure donation categories → Set up automated reporting. Supports one-time and recurring donations with automatic receipts."
        }
      ]
    },
    {
      id: "admin",
      title: "Admin & Church Dashboard",
      icon: <Settings className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      articles: [
        {
          title: "Managing Church Roles and Permissions",
          content: "Admin Portal → Member Directory → Click member name → Edit Role → Save. Available roles: Member, Volunteer, Pastor, Elder, Admin. Each role has different access levels to features and content moderation."
        },
        {
          title: "How to Moderate Content",
          content: "Admin Portal → Content Moderation → Review flagged posts → Approve/Remove/Edit → Notify users if needed. Set community guidelines and automated filters for inappropriate content."
        },
        {
          title: "Church Analytics Overview",
          content: "Dashboard shows: Active members, engagement rates, prayer request trends, event attendance, giving totals. Export reports for church leadership meetings and growth planning."
        },
        {
          title: "Customizing Your Church Page",
          content: "Admin Portal → Church Settings → Upload logo, set colors, add description, update contact info → Save changes. Customization appears throughout the app for your church members."
        }
      ]
    },
    {
      id: "mobile",
      title: "Mobile App Troubleshooting",
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      articles: [
        {
          title: "App Not Loading or Crashing",
          content: "Try: 1) Close and restart app, 2) Check internet connection, 3) Update to latest version, 4) Restart device, 5) Clear app cache (Android: Settings > Apps > SoapBox > Storage > Clear Cache)."
        },
        {
          title: "Fixing Notification Issues",
          content: "Check: Device Settings → Notifications → SoapBox → Allow notifications. Within app: Settings → Notifications → Enable desired types. Ensure 'Do Not Disturb' isn't blocking notifications."
        },
        {
          title: "App Permissions (Camera, Location, etc.)",
          content: "Device Settings → Apps → SoapBox → Permissions → Enable needed permissions. Camera: for profile photos, Location: for church discovery, Microphone: for prayer recordings (optional)."
        },
        {
          title: "How to Report a Bug",
          content: "Help → Report Bug → Describe issue, include screenshots → Submit. Include device type, app version, and steps to reproduce. Our support team responds within 24 hours."
        }
      ]
    },
    {
      id: "legal",
      title: "Legal & Privacy",
      icon: <Shield className="w-6 h-6" />,
      color: "from-gray-500 to-gray-600",
      articles: [
        {
          title: "Data Privacy Practices",
          content: "We protect your data with end-to-end encryption for sensitive content like prayer requests. Personal information is never sold. Church data remains within your church community. Full privacy policy available at soapboxsuperapp.com/privacy-policy."
        },
        {
          title: "How We Protect Your Data",
          content: "Security measures: SSL encryption, secure databases, regular backups, two-factor authentication, privacy controls for all content. Prayer requests and personal reflections use additional encryption layers."
        },
        {
          title: "Terms of Use & Community Guidelines",
          content: "Community guidelines promote respectful, faith-centered interaction. Prohibited: hate speech, harassment, spam, inappropriate content. Full terms available at soapboxsuperapp.com/terms-of-service."
        }
      ]
    }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6 text-white hover:bg-white/10 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contact
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Help Documentation
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-2">
              Find answers to your questions and learn how to make the most of SoapBox Super App
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white`}>
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 text-left">
                    {category.title}
                  </h2>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedCategory === category.id && (
                <div className="border-t border-gray-100">
                  {category.articles.map((article, index) => (
                    <div key={index} className="border-b border-gray-50 last:border-b-0">
                      <button
                        onClick={() => setExpandedArticle(expandedArticle === `${category.id}-${index}` ? null : `${category.id}-${index}`)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <h3 className="font-semibold text-gray-900">{article.title}</h3>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedArticle === `${category.id}-${index}` ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {expandedArticle === `${category.id}-${index}` && (
                        <div className="px-4 pb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                              {article.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-6">Try different keywords or browse our categories above</p>
            <Button
              onClick={() => setSearchQuery("")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Still Need Help Section */}
        <div className="mt-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you succeed with SoapBox Super App.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/contact-us'}
              className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button
              onClick={() => window.location.href = 'mailto:support@soapboxsuperapp.com'}
              className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </Button>
            <Button
              onClick={() => window.open('https://wa.me/message/BNZMR2CPIKVKA1', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}