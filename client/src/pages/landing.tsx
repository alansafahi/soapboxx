import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Calendar, MessageCircle, Star, ChevronRight } from "lucide-react";
import soapboxLogo from "@assets/SoapBx logo_1749625213720.jpeg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white to-light-blue">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={soapboxLogo} 
                alt="SoapBox Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-2xl font-bold text-gray-900">SoapBox Super App</span>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-faith-blue hover:bg-blue-600 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect with Your 
            <span className="text-faith-blue"> Faith Community</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join a platform that brings together believers, churches, and communities through 
            meaningful engagement, prayer, and spiritual growth.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-faith-blue hover:bg-blue-600 text-white px-8 py-4 text-lg"
          >
            Start Your Journey
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Faith Community
            </h2>
            <p className="text-lg text-gray-600">
              Modern tools to strengthen your spiritual journey and connect with others
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-faith-blue transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-light-blue rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-faith-blue" />
                </div>
                <CardTitle>Community Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Engage in meaningful conversations with fellow believers. Share insights, 
                  ask questions, and grow together in faith.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-faith-blue transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-warm-yellow rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-faith-gold" />
                </div>
                <CardTitle>Church Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stay connected with your church community. RSVP to events, join Bible studies, 
                  and participate in community service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-faith-blue transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Prayer Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share your prayer needs and pray for others. Experience the power of 
                  community prayer and spiritual support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-faith-blue transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Church Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find churches near you that align with your beliefs. Connect with new 
                  communities and expand your faith network.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-faith-blue transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Achievement Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your spiritual journey with meaningful achievements. 
                  Celebrate milestones in community engagement and growth.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-faith-blue transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Mobile First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access your faith community anywhere. Our mobile-optimized platform 
                  keeps you connected on the go.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Your Faith Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect with believers, grow in faith, and make a difference in your community.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src={soapboxLogo} 
              alt="SoapBox Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold">SoapBox Super App</span>
          </div>
          <p className="text-gray-400 mb-4">
            Connecting faith communities through modern technology
          </p>
          <p className="text-sm text-gray-500">
            © 2025 SoapBox Super App. Built with faith and community in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
