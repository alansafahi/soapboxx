import { Button } from "@/components/ui/button";
import { Heart, Users, Calendar, MessageCircle, Star, ChevronRight, Play, Shield, Zap, Globe } from "lucide-react";
import soapboxLogo from "@assets/SoapBx logo_1749626952136.jpeg";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// SoapBox Logo Component
const SoapBoxLogo = ({ className = "w-8 h-8", showText = true }: { className?: string; showText?: boolean }) => (
  <div className="flex items-center space-x-3">
    <img 
      src={soapboxLogo} 
      alt="SoapBox" 
      className={`${className} rounded-lg object-cover`}
    />
    {showText && <span className="text-xl font-bold text-gray-900">SoapBox</span>}
  </div>
);

export default function SimpleLanding() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const demoRequest = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      organization: formData.get('organization') as string,
      role: formData.get('role') as string,
      communitySize: formData.get('communitySize') as string,
      message: formData.get('message') as string,
    };

    try {
      // Simulate form submission - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Demo Request Submitted!",
        description: "We'll contact you within 24 hours to schedule your personalized demo.",
      });

      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-component="simple-landing">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div onClick={() => window.location.href = '/'} className="cursor-pointer">
              <SoapBoxLogo />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              Faith • Community • Connection
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Faith Community,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect, grow, and thrive with SoapBox - the all-in-one platform that brings 
            your faith community together through prayer, events, discussions, and spiritual growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const demoSection = document.getElementById('demo-signup');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg rounded-full font-semibold"
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
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything Your Faith Community Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed to strengthen connections, deepen faith, and build lasting community bonds.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Prayer Wall */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Prayer Wall</h3>
              <p className="text-gray-600 leading-relaxed">
                Share prayer requests and support your community through collective prayer and encouragement.
              </p>
            </div>

            {/* Community Events */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Events & Gatherings</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize and join church events, Bible studies, and community gatherings with seamless coordination.
              </p>
            </div>

            {/* Bible Reading */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Scripture</h3>
              <p className="text-gray-600 leading-relaxed">
                Follow personalized reading plans and grow in faith through guided daily scripture engagement.
              </p>
            </div>

            {/* Community Chat */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Chat</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with fellow believers through meaningful discussions and instant messaging.
              </p>
            </div>

            {/* Volunteer Management */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Volunteer Hub</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage volunteer opportunities and coordinate community service with smart scheduling.
              </p>
            </div>

            {/* Digital Giving */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl border border-pink-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Digital Giving</h3>
              <p className="text-gray-600 leading-relaxed">
                Secure and convenient digital donations with transparent tracking and receipt management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Faith Communities
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                SoapBox Super App was created with a deep understanding of what faith communities need to thrive in the digital age. 
                We combine spiritual purpose with cutting-edge technology to create meaningful connections.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Global Reach</h4>
                    <p className="text-gray-600">Connect with believers worldwide</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <Shield className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure & Private</h4>
                    <p className="text-gray-600">Your faith journey stays protected</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <Star className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Purpose-Driven</h4>
                    <p className="text-gray-600">Every feature designed for spiritual growth</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600 mb-6">Active Communities</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">500K+</div>
                    <div className="text-sm text-gray-600">Prayers Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">1M+</div>
                    <div className="text-sm text-gray-600">Bible Verses Read</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">25K+</div>
                    <div className="text-sm text-gray-600">Events Organized</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">150+</div>
                    <div className="text-sm text-gray-600">Countries Reached</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Faith Community?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of communities worldwide who are already using SoapBox to grow stronger together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
            >
              Start Your Journey
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full"
            >
              Schedule Demo
            </Button>
          </div>
          <div className="mt-8 text-blue-100">
            No credit card required • Free to get started
          </div>
        </div>
      </section>

      {/* Demo Signup Section */}
      <section id="demo-signup" className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Schedule a personalized demo to see how SoapBox can revolutionize your faith community's digital experience.
          </p>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Church/Organization Name *
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                  placeholder="Enter your church or organization name"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                >
                  <option value="">Select your role</option>
                  <option value="pastor">Pastor/Minister</option>
                  <option value="admin">Church Administrator</option>
                  <option value="volunteer">Volunteer Coordinator</option>
                  <option value="member">Church Member</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="communitySize" className="block text-sm font-medium text-gray-700 mb-2">
                  Community Size
                </label>
                <select
                  id="communitySize"
                  name="communitySize"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                >
                  <option value="">Select community size</option>
                  <option value="small">Under 100 members</option>
                  <option value="medium">100-500 members</option>
                  <option value="large">500-1000 members</option>
                  <option value="xl">Over 1000 members</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your needs (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors resize-none"
                  placeholder="What specific features or challenges would you like to discuss during the demo?"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Submitting..." : "Schedule My Demo"}
              </Button>
            </form>
            
            <p className="text-sm text-gray-600 mt-6 text-center">
              We'll contact you within 24 hours to schedule your personalized demo.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
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