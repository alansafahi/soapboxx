import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Heart, Users, Calendar, MessageCircle, Star, ChevronRight, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import soapboxLogo from "../assets/soapbox-logo.jpeg";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleStartJourney = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any existing sessions that might interfere
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
    }
    
    // Navigate to login page using React Router
    setLocation('/login');
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to destroy session
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Always trigger frontend logout regardless of backend response
      logout();
      
      // Redirect to landing page
      window.location.href = '/';
    } catch (error) {
      // Force logout and redirect even if there's an error
      logout();
      window.location.href = '/';
    }
  };

  const handleDashboard = async () => {
    // Force authentication check before navigation to ensure proper state
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        // Authentication confirmed, navigate to dashboard
        setLocation('/dashboard');
      } else {
        // Authentication failed, redirect to login
        setLocation('/login');
      }
    } catch (error) {
      setLocation('/login');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="relative bg-white border-b border-gray-200 w-full z-10">
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
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome back, {user?.firstName || user?.email}!
                </span>
                <Button 
                  onClick={handleDashboard}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect with Your 
            <span className="text-purple-600"> Faith Community</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join a platform that brings together believers, churches, and communities through 
            meaningful engagement, prayer, and spiritual growth.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={handleStartJourney}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-md font-medium flex items-center cursor-pointer transition-colors"
            >
              Start Your Journey
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
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
            <Card className="border-2 hover:border-purple-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
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

            <Card className="border-2 hover:border-purple-600 transition-colors">
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

            <Card className="border-2 hover:border-purple-600 transition-colors">
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

            <Card className="border-2 hover:border-purple-600 transition-colors">
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

            <Card className="border-2 hover:border-purple-600 transition-colors">
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

            <Card className="border-2 hover:border-purple-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Your Faith Community?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Connect with believers, grow in faith, and make a difference in your community.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
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
