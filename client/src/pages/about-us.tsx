import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Users, Lock, Shield, BookOpen, MessageCircle, Calendar, DollarSign, Star, ChevronRight, Check } from "lucide-react";

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

const ChurchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2H14V4H16V6H14V8H16V22H8V8H10V6H8V4H10V2Z"/>
    <path d="M6 10V22H4V10H6Z"/>
    <path d="M20 10V22H18V10H20Z"/>
    <circle cx="12" cy="12" r="2"/>
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

const SoapBoxLogo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <rect x="4" y="12" width="24" height="16" rx="2" fill="currentColor"/>
    <circle cx="16" cy="8" r="4" fill="currentColor"/>
    <path d="M14 6h4v4h-4z" fill="white"/>
  </svg>
);

export default function AboutUs() {
  useEffect(() => {
    document.title = "About Us - Faith-Based Digital Ministry Platform | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about SoapBox Super App - the all-in-one faith-based platform designed to help churches, ministries, and faith communities grow, connect, and thrive in the digital world.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-12 sm:py-16 px-4">
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
              <DoveIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              About SoapBox Super App
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 max-w-3xl mx-auto px-2">
              Faith-Based Church App for Digital Ministry & Community Engagement
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        
        {/* Mission Section */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                To build technology for the Church that strengthens relationships, enhances spiritual formation, and supports meaningful ministry in every season.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CrossIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Faith-First Technology</h3>
                    <p className="text-gray-600">Built exclusively for churches, not adapted from secular platforms.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Community Connection</h3>
                    <p className="text-gray-600">Strengthening relationships and building deeper spiritual bonds.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Safe & Secure</h3>
                    <p className="text-gray-600">Privacy-first design with no data reselling or ad tracking.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SoapBoxLogo className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  Complete Digital Ministry Platform
                </h3>
                <p className="text-gray-600 mb-6">
                  SoapBox Super App is the all-in-one platform designed to help churches, ministries, and faith-based communities grow, connect, and thrive in today's digital world.
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 italic">
                    "We empower churches of all sizes with tools for prayer, Bible study, communication, event planning, donations, and spiritual growth—all inside a single, secure, easy-to-use Christian app."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            What We Do
          </h2>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8 lg:p-12 mb-8">
            <p className="text-base sm:text-lg text-gray-700 text-center max-w-4xl mx-auto mb-8">
              SoapBox Super App is more than a church management system. It's a complete digital ministry platform that helps churches connect hearts, amplify worship, and extend the reach of the Gospel.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Share Devotionals & Sermons</h3>
                <p className="text-gray-600 text-sm">Distribute spiritual content and teachings to your community.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <PrayingHandsIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Prayer Walls</h3>
                <p className="text-gray-600 text-sm">Foster community prayer with moderated prayer request walls.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Bible Reading & S.O.A.P.</h3>
                <p className="text-gray-600 text-sm">Host Bible reading plans and Scripture journaling tools.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Connect Members</h3>
                <p className="text-gray-600 text-sm">Messaging, discussion boards, and community announcements.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Organize Events</h3>
                <p className="text-gray-600 text-sm">Plan small groups, events, and volunteer activities.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Accept Donations</h3>
                <p className="text-gray-600 text-sm">Secure online giving with comprehensive analytics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Who We Serve
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChurchIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Church Leaders</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pastors and leaders seeking digital transformation for their ministry.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrators</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Church staff and volunteers managing daily operations and programs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChurchIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Church Sizes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Faith communities from small groups to megachurches of every size.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Individuals</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Christians seeking to grow in faith and connect with community.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 px-4">
              Our Story
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-base sm:text-lg text-gray-700 mb-6 text-center">
                SoapBox began as a simple idea: What if the Church had a tech platform built exclusively for its mission—not adapted from secular tools?
              </p>
              
              <p className="text-base sm:text-lg text-gray-700 mb-8 text-center">
                Founded by believers with backgrounds in software engineering, ministry, and nonprofit leadership, SoapBox Super App was created to serve faith, not profit. Today, it's used by churches and ministries to connect hearts, amplify worship, and extend the reach of the Gospel.
              </p>
              
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic text-base sm:text-lg">
                  "SoapBox Super App has brought our church together in ways we never imagined. It's like having a digital sanctuary for our community."
                </p>
                <div className="font-semibold text-gray-900">Pastor L.</div>
                <div className="text-gray-500">California</div>
              </div>
            </div>
          </div>
        </section>

        {/* Safe & Secure Features */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Safe, Secure & Spirit-Led
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy-First</h3>
              <p className="text-gray-600 text-sm">No data reselling or ad tracking—your information stays sacred.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CrossIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Assisted</h3>
              <p className="text-gray-600 text-sm">AI-assisted, not AI-driven—always guided by faith values.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChurchIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Church-Built</h3>
              <p className="text-gray-600 text-sm">Custom-built for churches, not generic platforms.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile-Ready</h3>
              <p className="text-gray-600 text-sm">Designed for how members live, worship, and pray.</p>
            </div>
          </div>
        </section>

        {/* Join the Movement */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <DoveIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4">
            Join the Faith Tech Movement
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto px-4">
            Ready to unify your faith community? Experience where faith meets functionality.
          </p>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Grow. Connect. Pray. Reflect. Serve—together.</h3>
            <p className="text-purple-100 text-sm">SoapBox Super App: Faith Meets Functionality.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              Start Free Today
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