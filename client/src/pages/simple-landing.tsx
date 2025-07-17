import { Button } from "../components/ui/button";
import { Heart, Users, Calendar, MessageCircle, Star, ChevronRight, Play, Shield, Zap, Globe, Check, Gift, Cross, Sparkles } from "lucide-react";
import soapboxLogo from "../assets/soapbox-logo.jpeg";

// SoapBox Logo Component
const SoapBoxLogo = ({ className = "w-8 h-8", showText = true }: { className?: string; showText?: boolean }) => (
  <div className="flex items-center space-x-3">
    <img 
      src={soapboxLogo} 
      alt="SoapBox Super App Logo" 
      className={className}
    />
    {showText && (
      <span className="text-xl font-bold text-gray-900">SoapBox Super App</span>
    )}
  </div>
);

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 min-w-0">
              <img 
                src={soapboxLogo} 
                alt="SoapBox Super App Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
              />
              <span className="text-sm sm:text-xl font-bold text-gray-900 truncate">SoapBox Super App</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900 text-sm px-2 sm:px-4"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-2 sm:px-4"
                onClick={() => window.location.href = '/login'}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unite Your Faith
              <br />
              <span className="text-purple-600">Community</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
              SoapBox Super App brings your congregation together with powerful tools for prayer, 
              Bible study, events, and meaningful connections that strengthen faith and community bonds.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 justify-center items-center mb-12 px-4">
            <Button 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              <Play className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://www.calendly.com/soapboxsuperapp', '_blank')}
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-900 hover:text-gray-700 px-8 py-4 text-lg rounded-full font-semibold w-full sm:w-auto min-w-[200px]"
            >
              Schedule Demo
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Join thousands of faith communities worldwide
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              A Digital Ministry Hub
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Comprehensive tools designed specifically for faith communities to grow, connect, and thrive together.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Prayer Wall */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-8 mx-auto">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 text-center">Prayer Wall</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Create a sacred space where members can share prayer requests and receive community support 24/7.</p>
            </div>
            
            {/* Community */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-8 mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 text-center">Community Hub</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Build deeper relationships with automated small group formation and engagement tracking that grows participation by 40%.</p>
            </div>
            
            {/* Events */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-8 mx-auto">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 text-center">Event Management</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Easily schedule services and automate reminders across all ministries, saving 5+ hours weekly on coordination.</p>
            </div>
            
            {/* Bible Study */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-8 mx-auto">
                <Cross className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 text-center">Bible Study Tools</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">AI-powered study guides and S.O.A.P. journaling that help members engage with Scripture 3x more consistently.</p>
            </div>
            
            {/* Volunteer Management */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-8 mx-auto">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 text-center">Volunteer Hub</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Match members with their calling through smart volunteer matching, increasing ministry participation by 60%.</p>
            </div>
            
            {/* Communication */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-8 mx-auto">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 text-center">Digital Outreach</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Amplify your message with one-click publishing to 11+ platforms and personalized outreach that doubles engagement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Faith Communities Choose SoapBox Super App
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Built specifically for spiritual communities with the features that matter most.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 text-gray-900">Secure & Private</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                We treat your church's data with the sacred care it deserves—secure, private, and always under your control.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 text-gray-900">Easy to Use</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Intuitive design that works for all ages and technical abilities. Get started in minutes, not hours.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Cross className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 text-gray-900">Built for Faith</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Every feature is designed with spiritual communities in mind, supporting your unique needs and values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4">
              Choose the perfect plan for your faith community
            </p>
            
            {/* Special Offer Banner */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-4xl mx-auto mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5" />
                <span className="font-semibold text-lg">🎉 SUMMER PILOT SPECIAL</span>
              </div>
              <p className="text-lg">
                <strong>All fees waived for 6 months</strong> for churches signing up during our pilot phase this summer!
              </p>
            </div>
          </div>

          {/* Member Plans */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-2 text-gray-900">Individual Members</h3>
            <p className="text-center text-gray-600 mb-8">Goal: Spiritual growth and belonging</p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Basic</h4>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">Free</div>
                  <p className="text-gray-600 text-sm sm:text-base">100 credits/month</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">S.O.A.P. Journal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Prayer Wall Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Community Discussions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">100 credits per referral</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-sm sm:text-base">Get Started Free</Button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-purple-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <div className="text-center mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Standard</h4>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">$10/mo</div>
                  <p className="text-gray-600 text-sm">$100/year</p>
                  <p className="text-gray-600 text-sm sm:text-base">500 credits/month</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">AI-Powered Insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">100 credits per referral</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-sm sm:text-base">Choose Standard</Button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Premium</h4>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">$20/mo</div>
                  <p className="text-gray-600 text-sm">$200/year</p>
                  <p className="text-gray-600 text-sm sm:text-base">1,000 credits/month</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Everything in Standard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Custom Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">100 credits per referral</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 py-3 text-sm sm:text-base">Choose Premium</Button>
              </div>
            </div>
          </div>

          {/* Church Plans */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-2 text-gray-900">Church Plans</h3>
            <p className="text-center text-gray-600 mb-8">Goal: Engagement & Growth</p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Church Basic</h4>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">$50/mo</div>
                  <p className="text-gray-600 text-sm sm:text-base">2,500 credits/month</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Member Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Event Planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Communication Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">1,000 loyalty credits/6 months</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-sm sm:text-base">Start Church Basic</Button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Church Standard</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">$100/mo</div>
                  <p className="text-gray-600">5,000 credits/month</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Sermon Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>2,000 loyalty credits/6 months</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Choose Standard</Button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Church Premium</h4>
                  <div className="text-3xl font-bold text-gray-900 mb-2">Custom</div>
                  <p className="text-gray-600">Custom credits</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Everything in Standard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>White-label Solution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Dedicated Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Custom loyalty rewards</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-900 hover:bg-gray-800">Contact Sales</Button>
              </div>
            </div>
          </div>

          {/* Pay As You Go */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-8 text-gray-900">Addon Credit Boost Packs</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Boost Pack S</h4>
                <div className="text-2xl font-bold text-blue-600 mb-2">$25</div>
                <p className="text-gray-600">1,000 credits</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Boost Pack M</h4>
                <div className="text-2xl font-bold text-purple-600 mb-2">$50</div>
                <p className="text-gray-600">2,500 credits</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Boost Pack L</h4>
                <div className="text-2xl font-bold text-gray-900 mb-2">$100</div>
                <p className="text-gray-600">5,000 credits</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Purchase Credits
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Faith Communities
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              See how churches are growing and connecting with SoapBox Super App
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "SoapBox Super App transformed how our congregation connects. Prayer requests are answered faster, and our community feels more united than ever."
              </p>
              <div className="font-semibold text-gray-900">Pastor Michael Johnson</div>
              <div className="text-gray-500">Grace Community Church</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "The volunteer coordination features saved us hours each week. Now we can focus more on ministry and less on administration."
              </p>
              <div className="font-semibold text-gray-900">Sarah Williams</div>
              <div className="text-gray-500">Community Outreach Director</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Our small group Bible studies have never been more engaging. The discussion tools help everyone participate meaningfully."
              </p>
              <div className="font-semibold text-gray-900">David Chen</div>
              <div className="text-gray-500">Small Groups Pastor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-12 max-w-2xl mx-auto px-4">
            Join thousands of faith communities using SoapBox Super App to deepen connections and strengthen their spiritual journey together.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center px-4">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Free Today
            </Button>
            <Button 
              onClick={() => window.open('https://www.calendly.com/soapboxsuperapp', '_blank')}
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg rounded-full font-semibold transition-all duration-200 w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl"
            >
              Schedule Demo
            </Button>
          </div>
          
          <div className="mt-8 text-blue-100">
            No credit card required • Free to get started
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <SoapBoxLogo className="w-8 h-8" />
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering faith communities worldwide with innovative technology that brings people together, deepens spiritual connections, and transforms lives.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Prayer Wall</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bible Reading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Chat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Volunteer Hub</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 SoapBox Super App. All rights reserved. Built with faith and technology.
              </p>
              <p className="text-gray-400 text-sm mt-4 md:mt-0">
                Transforming communities through digital connection
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}