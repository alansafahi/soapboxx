import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Users, Lock, Clock, Bell, MessageCircle, Shield, Star, ChevronRight, Check } from "lucide-react";

// Custom Spiritual Icons
const CrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2V8H4V10H10V22H14V10H20V8H14V2H10Z"/>
  </svg>
);

const ChurchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2H14V4H16V6H14V8H16V22H8V8H10V6H8V4H10V2Z"/>
    <path d="M6 10V22H4V10H6Z"/>
    <path d="M20 10V22H18V10H20Z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const DoveIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.8 2 8 3.8 8 6C8 7.1 8.4 8.1 9 8.9C8.4 9.7 8 10.9 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 10.9 15.6 9.7 15 8.9C15.6 8.1 16 7.1 16 6C16 3.8 14.2 2 12 2ZM12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4Z"/>
    <path d="M12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z"/>
    <path d="M6 12C6 10.3 6.7 8.8 7.8 7.8L6.4 6.4C4.9 7.9 4 10.3 4 12.5C4 17.2 7.8 21 12.5 21C14.7 21 17.1 20.1 18.6 18.6L17.2 17.2C16.2 18.3 14.7 19 13 19H12C8.7 19 6 16.3 6 13V12Z"/>
  </svg>
);

const HeartCrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
    <path d="M11 6H13V11H18V13H13V18H11V13H6V11H11V6Z" fill="white"/>
  </svg>
);

const PrayerHandsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C10.5 2 9.3 3.2 9.3 4.7V11.3C9.3 12.8 10.5 14 12 14C13.5 14 14.7 12.8 14.7 11.3V4.7C14.7 3.2 13.5 2 12 2ZM12 16C9.8 16 8 17.8 8 20V22H16V20C16 17.8 14.2 16 12 16Z"/>
    <path d="M7 8C5.9 8 5 8.9 5 10V14C5 15.1 5.9 16 7 16C8.1 16 9 15.1 9 14V10C9 8.9 8.1 8 7 8Z"/>
    <path d="M17 8C15.9 8 15 8.9 15 10V14C15 15.1 15.9 16 17 16C18.1 16 19 15.1 19 14V10C19 8.9 18.1 8 17 8Z"/>
  </svg>
);

const GroupIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4ZM8 14C12.4 14 16 17.6 16 22H0C0 17.6 3.6 14 8 14ZM16 14C19.3 14 22 16.7 22 20V22H18V20C18 17.8 17.3 15.8 16 14Z"/>
  </svg>
);

export default function CommunityChatFeature() {
  useEffect(() => {
    document.title = "Community Chat - Faith-Based Discussion Platform | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect with your church community through SoapBox Super App faith-based discussion platform, small group chats, ministry forums, and moderated spiritual conversations.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-purple-800 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6 text-white hover:bg-white/10 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <GroupIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Community Chat & Discussion Platform
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto px-2">
              Foster meaningful connections and spiritual growth through faith-based discussions, small group chats, and moderated community forums.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        
        {/* Overview Section */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Build Deeper Faith Connections
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Our community chat platform isn't just about messaging—it's about creating sacred spaces for spiritual conversations, biblical discussions, and meaningful fellowship that strengthens your church family.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ministry-Focused Channels</h3>
                    <p className="text-gray-600">Organized discussion channels for different ministries, age groups, and spiritual topics.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Moderated Discussions</h3>
                    <p className="text-gray-600">Church leaders can moderate conversations to maintain healthy, Christ-centered dialogue.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Small Group Integration</h3>
                    <p className="text-gray-600">Connect small groups with dedicated chat spaces for deeper fellowship and study.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChurchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">#sunday-sermon</h4>
                    <p className="text-xs sm:text-sm text-gray-500">24 members active</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  "Pastor John's message about forgiveness really touched my heart. How do we apply this in difficult family situations?"
                </p>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <PrayerHandsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-gray-600">8 responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span className="text-gray-600">12 hearts</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HeartCrossIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">#youth-ministry</h4>
                    <p className="text-xs sm:text-sm text-gray-500">18 members active</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  "Who's excited for our upcoming mission trip? Let's pray for God's guidance and provision!"
                </p>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">
                  Join Discussion →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Features That Build Community
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <ChurchIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Ministry Channels</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Organized discussion channels for different ministries, departments, and special interest groups.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Moderation Tools</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Church leaders can moderate conversations and maintain healthy, Christ-centered dialogue.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <GroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Small Group Chats</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Dedicated chat spaces for small groups, Bible studies, and ministry teams.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <DoveIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Spiritual Topics</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Discussion threads focused on biblical topics, spiritual growth, and faith questions.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Smart Notifications</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Stay updated with relevant discussions while respecting quiet hours and preferences.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <PrayerHandsIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Prayer Integration</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Seamlessly connect discussions with prayer requests and spiritual support.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
              Why Churches Love Community Chat
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Strengthens Relationships</h3>
                    <p className="text-gray-600">Members build deeper connections through ongoing conversations and shared experiences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Extends Sunday Service</h3>
                    <p className="text-gray-600">Conversations continue throughout the week, extending the impact of worship and teaching.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Supports New Members</h3>
                    <p className="text-gray-600">New members can easily connect with others and find their place in the community.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enhances Small Groups</h3>
                    <p className="text-gray-600">Small groups stay connected between meetings with dedicated chat spaces.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Facilitates Ministry</h3>
                    <p className="text-gray-600">Ministry teams can coordinate, share resources, and support each other effectively.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Maintains Safe Environment</h3>
                    <p className="text-gray-600">Moderation tools ensure conversations remain edifying and Christ-centered.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            How Community Chat Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ChurchIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Join Channels</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Browse and join ministry channels, small groups, and discussion topics that interest you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <MessageCircle className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Share & Connect</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Share thoughts, ask questions, and engage in meaningful conversations with your church family.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <HeartCrossIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Grow Together</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Build lasting friendships and support each other in your spiritual journey and daily life.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CrossIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4">
            Ready to Connect Your Community?
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of churches building stronger communities through meaningful conversations and Christ-centered fellowship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.open('https://www.calendly.com/soapboxsuperapp', '_blank')}
            >
              Schedule Demo
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}