import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Users, Lock, Clock, Bell, MessageCircle, Shield, Star, ChevronRight, Check } from "lucide-react";

// Custom Spiritual Icons
const PrayerHandsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C10.5 2 9.3 3.2 9.3 4.7V11.3C9.3 12.8 10.5 14 12 14C13.5 14 14.7 12.8 14.7 11.3V4.7C14.7 3.2 13.5 2 12 2ZM12 16C9.8 16 8 17.8 8 20V22H16V20C16 17.8 14.2 16 12 16Z"/>
    <path d="M7 8C5.9 8 5 8.9 5 10V14C5 15.1 5.9 16 7 16C8.1 16 9 15.1 9 14V10C9 8.9 8.1 8 7 8Z"/>
    <path d="M17 8C15.9 8 15 8.9 15 10V14C15 15.1 15.9 16 17 16C18.1 16 19 15.1 19 14V10C19 8.9 18.1 8 17 8Z"/>
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

const ChurchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2H14V4H16V6H14V8H16V22H8V8H10V6H8V4H10V2Z"/>
    <path d="M6 10V22H4V10H6Z"/>
    <path d="M20 10V22H18V10H20Z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const HeartCrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
    <path d="M11 6H13V11H18V13H13V18H11V13H6V11H11V6Z" fill="white"/>
  </svg>
);

const BibleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2V22H18V20H6V4H18V2H4Z"/>
    <path d="M8 6H16V8H8V6Z"/>
    <path d="M8 10H16V12H8V10Z"/>
    <path d="M8 14H16V16H8V14Z"/>
    <path d="M20 4V22H22V4H20Z"/>
  </svg>
);

export default function PrayerWallFeature() {
  useEffect(() => {
    document.title = "Prayer Wall - Unite Your Community in Faith | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover how SoapBox Super App Prayer Wall strengthens your faith community through shared prayers, anonymous support, and 24/7 spiritual connection for churches worldwide.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-12 sm:py-16 px-4">
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
              <PrayerHandsIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Prayer Wall for Church Communities
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 max-w-3xl mx-auto px-2">
              Create a sacred digital space where your congregation can share prayer requests, offer support, and experience the power of community prayer 24/7.
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
                Transform Prayer into Community Connection
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                The Prayer Wall isn't just another messaging board—it's a sacred space designed specifically for faith communities to unite in prayer, support one another through life's challenges, and witness God's faithfulness together.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Always Available</h3>
                    <p className="text-gray-600">Community members can share prayer requests and receive support any time, day or night.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Anonymous Options</h3>
                    <p className="text-gray-600">Members can share sensitive requests anonymously while still receiving community support.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Prayer Tracking</h3>
                    <p className="text-gray-600">See who's praying for each request and track answered prayers to build faith testimonies.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm sm:text-base">SM</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Sarah Miller</h4>
                    <p className="text-xs sm:text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  Please pray for my father's surgery tomorrow. The doctors are optimistic, but we could use your prayers for peace and healing.
                </p>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span className="text-gray-600">12 praying</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-gray-600">3 comments</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Community Member</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Anonymous • 4 hours ago</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  Struggling with a difficult decision at work. Could use wisdom and guidance from above.
                </p>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span className="text-gray-600">8 praying</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-gray-600">5 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Powerful Features for Meaningful Prayer
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Advanced privacy controls let members choose between public, church-only, or anonymous prayer requests while maintaining complete security.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <DoveIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Spirit-Led Notifications</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Gentle reminders to pray for specific requests, updates on answered prayers, and notifications when someone joins in prayer.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <ChurchIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Community Support</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Members can offer encouragement, share scripture, and provide updates on their prayer requests to build stronger connections.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <CrossIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Prayer Categories</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Organize prayers by categories like healing, guidance, thanksgiving, or create custom categories for your church's specific needs.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <BibleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Prayer History</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Keep track of ongoing prayer requests, mark answered prayers, and build a testimony of God's faithfulness in your community.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <HeartCrossIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Pastoral Care</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Church leaders receive notifications about urgent prayer requests and can provide additional pastoral care and follow-up.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
              Why Churches Love the Prayer Wall
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Strengthens Community Bonds</h3>
                    <p className="text-gray-600">Members feel more connected knowing their church family is praying for them during difficult times.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Increases Prayer Participation</h3>
                    <p className="text-gray-600">Easy access to prayer requests encourages more members to participate in intercessory prayer.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Builds Faith Through Testimonies</h3>
                    <p className="text-gray-600">Tracking answered prayers creates powerful testimonies that strengthen the entire congregation's faith.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Supports Pastoral Care</h3>
                    <p className="text-gray-600">Pastors can identify members in need and provide timely pastoral care and support.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Encourages Vulnerability</h3>
                    <p className="text-gray-600">Anonymous options create safe spaces for members to share sensitive prayer requests.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">24/7 Spiritual Support</h3>
                    <p className="text-gray-600">Members can share urgent requests and receive immediate prayer support, even outside service hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            How the Prayer Wall Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <PrayerHandsIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Share Your Request</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Members can quickly share prayer requests with privacy options: public, church-only, or anonymous.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ChurchIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Community Prays</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Other members see the request, tap to pray, and can offer encouragement or relevant scripture.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <HeartCrossIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Celebrate Answers</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Request owners can mark prayers as answered, creating testimonies that inspire the whole community.
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
            Ready to Transform Your Church's Prayer Life?
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of churches already using the Prayer Wall to strengthen their communities and witness God's faithfulness together.
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