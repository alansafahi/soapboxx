import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Users, Lock, Clock, Bell, MessageCircle, Shield, Star, ChevronRight, Check } from "lucide-react";

// Custom Spiritual Icons
const CrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2V8H4V10H10V22H14V10H20V8H14V2H10Z"/>
  </svg>
);

const HeartCrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
    <path d="M11 6H13V11H18V13H13V18H11V13H6V11H11V6Z" fill="white"/>
  </svg>
);

const ServingHandsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 11H7L5.5 7.5C5.15 6.65 5.4 5.7 6.05 5.05C6.7 4.4 7.65 4.15 8.5 4.5L10 5V9C10 10.1 9.1 11 8 11H7L9 11ZM20 12V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V12H20ZM14 5L15.5 4.5C16.35 4.15 17.3 4.4 17.95 5.05C18.6 5.7 18.85 6.65 18.5 7.5L17 11H15C13.9 11 13 10.1 13 9V5H14Z"/>
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

const VolunteerIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 10.5V19L13.5 17.5V10.5M9.5 10.5V19L8 17.5V10.5M3 9V7L9 7.5V9M10.5 7.5L13.5 7.5V9L10.5 9V7.5Z"/>
  </svg>
);

export default function VolunteerHubFeature() {
  useEffect(() => {
    document.title = "Volunteer Hub - Ministry & Service Coordination | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Streamline volunteer coordination with SoapBox Super App volunteer hub, ministry team management, service scheduling, and community service opportunities for church volunteers.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-red-700 text-white py-12 sm:py-16 px-4">
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
              <ServingHandsIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Volunteer Hub & Ministry Coordination
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-orange-100 max-w-3xl mx-auto px-2">
              Empower your church's mission through organized volunteer coordination, ministry team management, and service opportunities that make a lasting impact.
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
                Mobilize Your Church for Kingdom Impact
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Our volunteer hub transforms how your church coordinates ministry teams, manages service opportunities, and empowers members to serve with their God-given gifts and talents.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ministry Team Management</h3>
                    <p className="text-gray-600">Organize and coordinate ministry teams with scheduling, communication, and resource management.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Service Opportunities</h3>
                    <p className="text-gray-600">Create and manage volunteer opportunities that match members' skills and availability.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Skills & Gifts Matching</h3>
                    <p className="text-gray-600">Connect volunteers with opportunities that align with their spiritual gifts and talents.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChurchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Sunday Morning Team</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Welcomes & Ushers</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  Help create a welcoming environment for Sunday morning worship services.
                </p>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ServingHandsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-gray-600">12 volunteers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-gray-600">2 spots open</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HeartCrossIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Community Outreach</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Food Bank Ministry</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  Serve our community by helping distribute food to families in need.
                </p>
                <div className="text-xs sm:text-sm text-orange-600 font-medium">
                  Sign Up Today →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Complete Volunteer Management Solution
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <VolunteerIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Team Organization</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Create and manage ministry teams with clear roles, responsibilities, and communication channels.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Scheduling System</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Coordinate volunteer schedules with automated reminders and easy shift management.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <ServingHandsIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Skills Matching</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Match volunteers with opportunities that align with their spiritual gifts and talents.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Communication Hub</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Keep teams connected with messaging, updates, and resource sharing capabilities.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <HeartCrossIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Opportunity Board</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Showcase volunteer opportunities with detailed descriptions and easy sign-up processes.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recognition System</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Celebrate volunteers with appreciation tracking, badges, and recognition programs.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
              Why Churches Love Our Volunteer Hub
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Increases Volunteer Engagement</h3>
                    <p className="text-gray-600">Easy sign-up processes and clear expectations lead to higher volunteer participation.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Streamlines Coordination</h3>
                    <p className="text-gray-600">Automated scheduling and communication reduce administrative burden on staff.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Maximizes Ministry Impact</h3>
                    <p className="text-gray-600">Well-organized teams and clear roles lead to more effective ministry outcomes.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Develops Spiritual Gifts</h3>
                    <p className="text-gray-600">Members discover and develop their spiritual gifts through meaningful service opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Builds Community</h3>
                    <p className="text-gray-600">Serving together creates stronger bonds and deeper relationships within the church.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reduces Burnout</h3>
                    <p className="text-gray-600">Shared responsibilities and organized rotation prevent volunteer burnout and fatigue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            How Volunteer Hub Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <VolunteerIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Discover Opportunities</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Browse available volunteer opportunities and ministry teams that match your interests and availability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ServingHandsIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Sign Up & Serve</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Sign up for opportunities, receive training materials, and connect with your team leaders.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <HeartCrossIcon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Make Impact</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Serve with purpose, track your ministry impact, and celebrate how God uses your gifts.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CrossIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4">
            Ready to Mobilize Your Church?
          </h2>
          <p className="text-base sm:text-lg text-orange-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of churches empowering their members to serve with purpose and make a lasting kingdom impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
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