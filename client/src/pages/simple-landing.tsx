import { Button } from "@/components/ui/button";
import { Heart, Users, Calendar, MessageCircle, Star, ChevronRight, Play, Shield, Zap, Globe } from "lucide-react";
import soapboxLogo from "@assets/SoapBx logo_1749627505398.jpeg";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <SoapBoxLogo />
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unite Your Faith
              <br />
              <span className="text-blue-600">Community</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              SoapBox Super App brings your congregation together with powerful tools for prayer, 
              Bible study, events, and meaningful connections that strengthen faith and community bonds.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/demo'}
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-900 hover:text-gray-700 px-8 py-4 text-lg rounded-full font-semibold"
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
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Community Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for faith communities to grow, connect, and thrive together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Prayer Wall */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Prayer Wall</h3>
              <p className="text-gray-600">Share prayer requests and lift each other up in a sacred, supportive space.</p>
            </div>
            
            {/* Community */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Community Hub</h3>
              <p className="text-gray-600">Connect with fellow believers through groups, discussions, and shared experiences.</p>
            </div>
            
            {/* Events */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Event Management</h3>
              <p className="text-gray-600">Organize services, study groups, and community events with seamless coordination.</p>
            </div>
            
            {/* Bible Study */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Bible Study Tools</h3>
              <p className="text-gray-600">Interactive study guides, devotionals, and reading plans for spiritual growth.</p>
            </div>
            
            {/* Volunteer Management */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Volunteer Hub</h3>
              <p className="text-gray-600">Coordinate service opportunities and empower members to serve with purpose.</p>
            </div>
            
            {/* Communication */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Digital Outreach</h3>
              <p className="text-gray-600">Reach your community with announcements, newsletters, and spiritual content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Faith Communities Choose SoapBox Super App
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for spiritual communities with the features that matter most.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Secure & Private</h3>
              <p className="text-gray-600 text-lg">
                Your community's data is protected with enterprise-grade security and privacy controls you can trust.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Easy to Use</h3>
              <p className="text-gray-600 text-lg">
                Intuitive design that works for all ages and technical abilities. Get started in minutes, not hours.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Built for Faith</h3>
              <p className="text-gray-600 text-lg">
                Every feature is designed with spiritual communities in mind, supporting your unique needs and values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Faith Communities
            </h2>
            <p className="text-xl text-gray-600">
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
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of faith communities using SoapBox Super App to deepen connections and strengthen their spiritual journey together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Free Today
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/demo'}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg rounded-full font-semibold transition-all duration-200"
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