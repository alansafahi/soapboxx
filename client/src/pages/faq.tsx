import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Users, Shield, CreditCard, Smartphone, Settings, MessageCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'church' | 'pricing' | 'technical' | 'features' | 'security';
}

const faqs: FAQItem[] = [
  // General User Questions
  {
    id: 'what-is-soapbox',
    question: 'What is the SoapBox Super App?',
    answer: 'SoapBox Super App is a comprehensive faith-based community platform where you can pray, journal, connect with others, and participate in church life — all in one place. It includes S.O.A.P. journaling, prayer walls, community discussions, event management, and AI-powered ministry tools.',
    category: 'general'
  },
  {
    id: 'who-is-app-for',
    question: 'Who is the app designed for?',
    answer: 'SoapBox is designed for Christians of all backgrounds — individuals, families, church leaders, and ministry staff — seeking a deeper connection to faith and community life. It serves everyone from individual believers to large church organizations.',
    category: 'general'
  },
  {
    id: 'main-features',
    question: 'What are the main features I can use?',
    answer: 'You can: Create and respond to prayer requests, Write S.O.A.P. journal reflections, Join community discussions and events, Use AI for scripture study and devotionals, Participate in church giving, Attend virtual events and services, Connect with other believers, Track your spiritual growth with daily check-ins.',
    category: 'features'
  },
  {
    id: 'is-free',
    question: 'Is SoapBox really free to use?',
    answer: 'Yes! SoapBox offers a robust free plan with 100 credits per month that includes S.O.A.P. journaling, prayer wall access, community discussions, and basic AI features. Paid plans ($10-20/month) offer additional credits and advanced features.',
    category: 'pricing'
  },
  {
    id: 'use-without-church',
    question: 'Can I use it even if my church hasn\'t joined?',
    answer: 'Absolutely! You can access most features individually and still benefit from the community aspects. You can join public churches, participate in general discussions, and use all personal spiritual growth tools.',
    category: 'general'
  },
  {
    id: 'join-church',
    question: 'How do I join a church on the app?',
    answer: 'Search for your church in the app using the church discovery feature. If it\'s listed as public, you can join instantly. Private churches require approval from church administrators.',
    category: 'general'
  },
  {
    id: 'vs-social-media',
    question: 'How is SoapBox different from regular social media?',
    answer: 'SoapBox centers specifically on faith, prayer, scripture study, and intentional spiritual community — not entertainment or status updates. It\'s designed to support and strengthen your spiritual life rather than distract from it.',
    category: 'general'
  },
  {
    id: 'events-livestream',
    question: 'Can I attend services and events through the app?',
    answer: 'Yes! You can RSVP to virtual and in-person events, attend public livestreams, and participate in church activities shared by your church or other public churches.',
    category: 'features'
  },
  {
    id: 'notifications',
    question: 'Will I receive notifications about prayers and posts?',
    answer: 'Yes, and you have complete control over which notifications you receive. You can customize notification preferences for prayers, discussions, events, and other activities.',
    category: 'features'
  },
  {
    id: 'connect-outside-church',
    question: 'Can I connect with people outside my church?',
    answer: 'Yes! You can join public churches, participate in community prayer threads, join discussions, and connect with believers from different congregations while maintaining your primary church affiliation.',
    category: 'general'
  },
  {
    id: 'privacy-safety',
    question: 'Is my information safe and private?',
    answer: 'Yes. SoapBox uses enterprise-grade encryption, secure databases, and role-based privacy controls. You can set posts and prayers to automatically expire, control who sees your content, and manage your privacy settings granularly.',
    category: 'security'
  },
  {
    id: 'anonymous-posting',
    question: 'Can I post anonymously?',
    answer: 'Yes! You can post anonymous prayers and S.O.A.P. reflections depending on your church\'s settings and your personal privacy preferences.',
    category: 'security'
  },
  {
    id: 'profile-customization',
    question: 'Can I customize my profile?',
    answer: 'Yes — add a profile photo, write a bio, include your favorite Bible verses, and personalize your presence in the app to reflect your faith journey.',
    category: 'features'
  },
  {
    id: 'getting-help',
    question: 'What if I need help using the app?',
    answer: 'You can reach us through our live chat widget (bottom-right corner), submit a support request through the contact page, or browse our comprehensive help documentation.',
    category: 'general'
  },
  {
    id: 'mobile-apps',
    question: 'Is SoapBox available on mobile app stores?',
    answer: 'Currently, SoapBox is a web application that works perfectly on mobile browsers. Native mobile apps for iOS and Android are planned for future release. The web version is fully optimized for mobile use.',
    category: 'technical'
  },
  {
    id: 'offline-features',
    question: 'Does the app work offline?',
    answer: 'Some features like reading past journal entries and saved content work offline. Most interactive features (prayer wall, chat, livestreams, discussions) require an internet connection.',
    category: 'technical'
  },
  {
    id: 'international-use',
    question: 'Can I use SoapBox internationally?',
    answer: 'Yes! Anyone with internet access can use SoapBox regardless of their country. Our platform is designed to serve the global Christian community.',
    category: 'technical'
  },
  {
    id: 'language-support',
    question: 'Is SoapBox available in other languages?',
    answer: 'Currently, SoapBox is available in English. Multi-language support is on our roadmap — let us know what language you need and we\'ll prioritize it!',
    category: 'technical'
  },

  // Church Admin Questions
  {
    id: 'church-features',
    question: 'What does SoapBox offer churches?',
    answer: 'SoapBox provides a complete digital ministry platform including: Prayer wall management and moderation, Sermon Studio with AI assistance, Member engagement analytics, Bible study and devotional tools, Customizable permissions and roles, Direct member communication tools, Donation tracking and analytics, Event management and attendance tracking.',
    category: 'church'
  },
  {
    id: 'church-pricing',
    question: 'How much does SoapBox cost for churches?',
    answer: 'Churches currently enjoy special pilot pricing with 6 months free when signing up during our summer program. After that, pricing is based on feature usage and AI credits rather than member count, making it affordable for churches of all sizes.',
    category: 'pricing'
  },
  {
    id: 'church-customization',
    question: 'Can churches customize the app interface?',
    answer: 'Yes! Church administrators can show/hide specific features for different roles (pastor, staff, volunteers, members), create message templates, configure menus, and customize the experience to match your church\'s workflow and preferences.',
    category: 'church'
  },
  {
    id: 'role-management',
    question: 'How are church roles managed?',
    answer: 'Church administrators can assign various roles including Pastor, Youth Leader, Media Director, Volunteer, and custom roles, each with specific access rights and permissions tailored to their responsibilities.',
    category: 'church'
  },
  {
    id: 'bulk-invites',
    question: 'Can we invite all our members at once?',
    answer: 'Yes! Use bulk email invitations or generate QR codes from your church admin dashboard to easily onboard your entire congregation.',
    category: 'church'
  },
  {
    id: 'content-moderation',
    question: 'Can we moderate and remove content?',
    answer: 'Yes. Church administrators can remove inappropriate content, set expiration dates for events and posts, review flagged material, and maintain community standards. Users can also set their own posts to auto-delete.',
    category: 'church'
  },
  {
    id: 'youth-safety',
    question: 'Is SoapBox safe for children and youth?',
    answer: 'Yes! Youth accounts can be placed in restricted-access groups, monitored by designated staff, and parental controls can be enabled to ensure a safe environment for young users.',
    category: 'security'
  },
  {
    id: 'ai-credits-explained',
    question: 'What are AI credits and how do they work?',
    answer: 'AI credits power features like prayer assistance, devotional writing, sermon preparation, and scripture study. Users earn credits through engagement: creating discussions, posting content, responding to prayers, daily check-ins, reading Bible verses, and attending events.',
    category: 'features'
  },
  {
    id: 'analytics-dashboard',
    question: 'Is there an analytics dashboard for churches?',
    answer: 'Yes! Track member engagement, prayer activity, giving trends, event attendance, user behavior patterns, and community health metrics — all in one comprehensive admin dashboard.',
    category: 'church'
  },
  {
    id: 'data-export',
    question: 'Can we export our church data?',
    answer: 'Yes. Export donation records, attendance data, S.O.A.P. journals, user activity logs, and engagement metrics as CSV or PDF files for your records and reporting needs.',
    category: 'church'
  },
  {
    id: 'denominations-supported',
    question: 'What denominations does SoapBox support?',
    answer: 'SoapBox is non-denominational and designed to serve all Christian traditions — including Evangelical, Catholic, Protestant, Charismatic, Reformed, Anglican, Pentecostal, Orthodox, and Independent churches. Our platform adapts to your theological preferences.',
    category: 'church'
  },
  {
    id: 'integration-with-tools',
    question: 'Can we use SoapBox with our existing church tools?',
    answer: 'Yes! Many churches use SoapBox alongside tools like Planning Center, Tithely, Slack, Google Workspace, and more. SoapBox is designed to complement your existing workflow, and many churches find they can eventually consolidate more activities within SoapBox.',
    category: 'church'
  },

  // Additional Technical and Pricing Questions
  {
    id: 'individual-pricing-plans',
    question: 'What are the individual pricing plans?',
    answer: 'FREE: 100 credits/month with core features. STANDARD: $10/month (500 credits) with AI insights and priority support. PREMIUM: $20/month (1,000 credits) with advanced analytics and custom integrations. All plans include S.O.A.P. journaling, prayer wall, and community features.',
    category: 'pricing'
  },
  {
    id: 'credit-boost-packs',
    question: 'Can I purchase additional credits?',
    answer: 'Yes! Credit boost packs are available: Small ($25 for 1,000 credits), Medium ($50 for 2,500 credits), Large ($100 for 5,000 credits). Perfect for high-usage periods or special ministry projects.',
    category: 'pricing'
  },
  {
    id: 'what-uses-credits',
    question: 'What features use AI credits?',
    answer: 'AI credits are used for: AI-assisted prayer generation, Scripture study and commentary, Sermon preparation and outlines, Devotional writing assistance, Bible verse recommendations, Content enhancement and suggestions, Automated insights and analytics.',
    category: 'features'
  },
  {
    id: 'earning-free-credits',
    question: 'How can I earn free credits?',
    answer: 'Earn credits through community engagement: Daily check-ins (+5 credits), Posting prayers or discussions (+3 credits), Responding to prayers (+2 credits), Attending events (+5 credits), Reading daily Bible verses (+2 credits), Referring new users (bonus credits).',
    category: 'features'
  }
];

const categories = [
  { id: 'general', name: 'General', icon: HelpCircle },
  { id: 'features', name: 'Features', icon: Settings },
  { id: 'church', name: 'Churches', icon: Users },
  { id: 'pricing', name: 'Pricing', icon: CreditCard },
  { id: 'security', name: 'Privacy & Safety', icon: Shield },
  { id: 'technical', name: 'Technical', icon: Smartphone }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Find answers to common questions about SoapBox Super App
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              All Questions
            </button>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  <IconComponent size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = openItems.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <MessageCircle size={48} className="mx-auto mb-4 text-blue-100" />
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </a>
            <button 
              onClick={() => {
                // This will trigger the chat widget
                const chatWidget = document.querySelector('[data-chat-widget]') as HTMLElement;
                if (chatWidget) {
                  chatWidget.click();
                }
              }}
              className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}