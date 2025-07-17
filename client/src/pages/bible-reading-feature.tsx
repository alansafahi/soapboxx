import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Users, Lock, Clock, Bell, MessageCircle, Shield, Star, ChevronRight, Check } from "lucide-react";

// Custom Spiritual Icons
const BibleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2V22H18V20H6V4H18V2H4Z"/>
    <path d="M8 6H16V8H8V6Z"/>
    <path d="M8 10H16V12H8V10Z"/>
    <path d="M8 14H16V16H8V14Z"/>
    <path d="M20 4V22H22V4H20Z"/>
  </svg>
);

const CrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2V8H4V10H10V22H14V10H20V8H14V2H10Z"/>
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

const ScrollIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"/>
    <path d="M14 2V8H20"/>
    <path d="M8 12H16"/>
    <path d="M8 14H16"/>
    <path d="M8 16H13"/>
  </svg>
);

const LightIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z"/>
  </svg>
);

export default function BibleReadingFeature() {
  useEffect(() => {
    document.title = "Bible Reading - Daily Scripture & Study Tools | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Enhance your daily Bible reading with SoapBox Super App spiritual study tools, guided devotionals, and community scripture discussions for deeper faith growth.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 sm:py-16 px-4">
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
              <BibleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Bible Reading & Study Tools
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-2">
              Transform your daily Bible reading with guided devotionals, interactive study tools, and community scripture discussions that deepen your faith journey.
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
                Make Scripture Come Alive Daily
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Our Bible reading tools aren't just about reading verses—they're about experiencing God's Word in transformative ways through guided study, community insights, and personal reflection.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Daily Reading Plans</h3>
                    <p className="text-gray-600">Structured Bible reading plans that guide you through Scripture with purpose and understanding.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Study Companions</h3>
                    <p className="text-gray-600">Interactive study guides, commentary, and reflection questions to deepen your understanding.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Community Discussions</h3>
                    <p className="text-gray-600">Share insights and learn from others as you study Scripture together with your church community.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BibleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Today's Reading</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Psalms 23:1-6</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base italic">
                  "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures..."
                </p>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <HeartCrossIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span className="text-gray-600">24 reflecting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-gray-600">8 insights</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <LightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Study Guide</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Shepherd's Care Theme</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  Reflection Question: How have you experienced God's guidance in your life this week?
                </p>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                  Continue Study →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Powerful Tools for Scripture Study
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <BibleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Multiple Translations</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Access multiple Bible translations and compare verses side-by-side to gain deeper understanding of Scripture.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <ScrollIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Study Guides</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Interactive study guides with commentary, historical context, and reflection questions to enhance your understanding.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <DoveIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Daily Devotionals</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Spirit-led daily devotionals that connect Scripture to your everyday life with practical applications.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <HeartCrossIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Personal Journal</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Keep a digital journal of your insights, prayers, and reflections as you study God's Word.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Group Studies</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Participate in church-wide Bible studies with discussion forums and group reflection activities.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <LightIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Reading Progress</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Track your reading progress and celebrate milestones in your spiritual journey through Scripture.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
              Why Churches Love Our Bible Reading Tools
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Increases Scripture Engagement</h3>
                    <p className="text-gray-600">Members spend more time in God's Word with guided reading plans and interactive study tools.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Builds Bible Literacy</h3>
                    <p className="text-gray-600">Study guides and commentary help members understand Scripture context and meaning.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Strengthens Community</h3>
                    <p className="text-gray-600">Group studies and discussion forums create deeper connections through shared Scripture study.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Supports Spiritual Growth</h3>
                    <p className="text-gray-600">Personal journaling and reflection tools help members apply Scripture to their daily lives.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enhances Teaching</h3>
                    <p className="text-gray-600">Pastors can create custom study guides and track congregation engagement with Scripture.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Accessible Anywhere</h3>
                    <p className="text-gray-600">Mobile-friendly design lets members study Scripture anytime, anywhere with full features.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            How Bible Reading Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <BibleIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Select from various reading plans: chronological, thematic, or follow along with your church's current series.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <LightIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Study & Reflect</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Use study guides, commentary, and reflection questions to deepen your understanding of each passage.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Users className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Share & Discuss</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Join community discussions, share insights, and learn from others studying the same passages.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CrossIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4">
            Ready to Transform Your Bible Study?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of believers already deepening their faith through our interactive Bible reading and study tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
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