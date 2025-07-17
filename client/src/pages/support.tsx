import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Calendar, Book, Shield, Users, FileText, Play, Download, Settings, CreditCard, Heart, Phone, Clock, CheckCircle, ExternalLink } from "lucide-react";

// Custom Spiritual Icons
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

const PrayingHandsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8.5C11.3 8.5 10.8 9 10.8 9.6V17.4C10.8 18 11.3 18.5 12 18.5C12.7 18.5 13.2 18 13.2 17.4V9.6C13.2 9 12.7 8.5 12 8.5Z"/>
    <path d="M9 7C8.4 7 8 7.4 8 8V16C8 16.6 8.4 17 9 17C9.6 17 10 16.6 10 16V8C10 7.4 9.6 7 9 7Z"/>
    <path d="M15 7C14.4 7 14 7.4 14 8V16C14 16.6 14.4 17 15 17C15.6 17 16 16.6 16 16V8C16 7.4 15.6 7 15 7Z"/>
    <path d="M6 9C5.4 9 5 9.4 5 10V14C5 14.6 5.4 15 6 15C6.6 15 7 14.6 7 14V10C7 9.4 6.6 9 6 9Z"/>
    <path d="M18 9C17.4 9 17 9.4 17 10V14C17 14.6 17.4 15 18 15C18.6 15 19 14.6 19 14V10C19 9.4 18.6 9 18 9Z"/>
  </svg>
);

export default function Support() {
  useEffect(() => {
    document.title = "Support - Help Center & Ministry Tech Support | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get help with SoapBox Super App features, church administration, and ministry technology. Our support team is here to help your faith community thrive with guides, live chat, and expert assistance.');
    }

    // Keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'church app support, ministry tech help, prayer wall guide, SoapBox Super App help center, church administration support, faith technology assistance');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-12 sm:py-16 px-4">
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
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Support
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-2">
              We're Here to Help Your Ministry Thrive
            </p>
            <p className="text-sm sm:text-base text-blue-200 max-w-2xl mx-auto mt-4 px-2">
              At SoapBox, we're committed to helping your faith community flourish with technology that's simple, secure, and sacred.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        
        {/* Contact Support Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Contact Support
          </h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 lg:p-12 mb-8">
            <p className="text-base sm:text-lg text-gray-700 text-center max-w-2xl mx-auto mb-8">
              Can't find what you're looking for? Reach out directly:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <a href="mailto:support@soapboxsuperapp.com" className="text-blue-600 hover:underline font-medium">
                  support@soapboxsuperapp.com
                </a>
                <p className="text-gray-500 text-sm mt-2">Replies within 1 business day</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm">In-app chat support</p>
                <p className="text-gray-500 text-sm mt-2">Mon–Fri, 9am–6pm PT</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Schedule a Call</h3>
                <Button
                  onClick={() => window.open('https://www.calendly.com/soapboxsuperapp', '_blank')}
                  className="bg-purple-600 hover:bg-purple-700 text-white mt-2 w-full"
                >
                  Book Support Call
                </Button>
                <p className="text-gray-500 text-xs mt-2">Ministry tech advisors</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Features & Usage */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Need Help With...
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Get quick answers and how-to guides for all SoapBox features:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <PrayingHandsIcon className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Prayer Wall & Prayer Circles</h3>
                    <p className="text-gray-600 text-sm">Create and manage prayer requests and community prayer circles</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Book className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">S.O.A.P. Journaling</h3>
                    <p className="text-gray-600 text-sm">Scripture, Observation, Application, Prayer journaling tools</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Event Scheduling & RSVPs</h3>
                    <p className="text-gray-600 text-sm">Plan church events and manage member attendance</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Settings className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Church Admin Dashboard</h3>
                    <p className="text-gray-600 text-sm">Manage church settings, members, and permissions</p>
                  </div>
                </div>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-6 w-full sm:w-auto">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Help Center
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  New to SoapBox?
                </h3>
                <p className="text-gray-600 mb-6">
                  Welcome! Explore our onboarding resources to get started:
                </p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Quick Start Video
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Admin Onboarding PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="w-4 h-4 mr-2" />
                    Explore Features
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Guides */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Popular Guides
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="#" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Getting Started with Your Church Account
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Complete setup guide for church administrators</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    How to Invite and Manage Church Staff
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Add team members and set role-based permissions</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Understanding Privacy & Visibility Settings
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Control who sees what in your church community</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Sharing Devotionals on Social Feed
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Create and share spiritual content with your community</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Setting Expiration Dates for Posts
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Manage time-sensitive content and announcements</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Account & Billing Management
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Update payment methods and manage subscriptions</p>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* Additional Support Sections */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Security & Privacy */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Security & Privacy
              </h2>
              <p className="text-gray-600 mb-6">
                Your trust is sacred to us. Learn more about how we protect your data:
              </p>
              
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  How We Keep Your Data Secure
                </a>
                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Privacy Controls for Churches & Members
                </a>
              </div>
            </div>

            {/* Community */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Join the SoapBox Community
              </h2>
              <p className="text-gray-600 mb-6">
                Connect with other church leaders and stay updated:
              </p>
              
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Visit Our Church Leader Forum
                </a>
                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Monthly Tips & Devotional Tools
                </a>
                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Suggest a New Feature
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CrossIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Still Stuck? Let's Pray and Proceed Together.
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Sometimes a little faith (and help) goes a long way. If you're feeling overwhelmed, we're here to walk with you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => window.location.href = 'mailto:support@soapboxsuperapp.com'}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button 
              size="lg"
              className="bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-3 text-lg font-semibold w-full sm:w-auto min-w-[200px] transition-all duration-200"
              onClick={() => window.location.href = '/features/prayer-wall'}
            >
              <Heart className="w-4 h-4 mr-2" />
              Submit Prayer Request
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}