import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Users, Lock, Clock, Bell, MessageCircle, Shield, Star, ChevronRight, Check } from "lucide-react";

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
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Prayer Wall for Church Communities
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 max-w-3xl mx-auto">
              Create a sacred digital space where your congregation can share prayer requests, offer support, and experience the power of community prayer 24/7.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Overview Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Transform Prayer into Community Connection
              </h2>
              <p className="text-lg text-gray-600 mb-8">
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
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">SM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Miller</h4>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Please pray for my father's surgery tomorrow. The doctors are optimistic, but we could use your prayers for peace and healing.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">12 praying</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">3 comments</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community Member</h4>
                    <p className="text-sm text-gray-500">Anonymous • 4 hours ago</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Struggling with a difficult decision at work. Could use wisdom and guidance from above.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">8 praying</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">5 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Powerful Features for Meaningful Prayer
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h3>
              <p className="text-gray-600">
                Advanced privacy controls let members choose between public, church-only, or anonymous prayer requests while maintaining complete security.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Notifications</h3>
              <p className="text-gray-600">
                Gentle reminders to pray for specific requests, updates on answered prayers, and notifications when someone joins in prayer.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Support</h3>
              <p className="text-gray-600">
                Members can offer encouragement, share scripture, and provide updates on their prayer requests to build stronger connections.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prayer Categories</h3>
              <p className="text-gray-600">
                Organize prayers by categories like healing, guidance, thanksgiving, or create custom categories for your church's specific needs.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prayer History</h3>
              <p className="text-gray-600">
                Keep track of ongoing prayer requests, mark answered prayers, and build a testimony of God's faithfulness in your community.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pastoral Care</h3>
              <p className="text-gray-600">
                Church leaders receive notifications about urgent prayer requests and can provide additional pastoral care and follow-up.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
              Why Churches Love the Prayer Wall
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
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
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            How the Prayer Wall Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Request</h3>
              <p className="text-gray-600">
                Members can quickly share prayer requests with privacy options: public, church-only, or anonymous.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Prays</h3>
              <p className="text-gray-600">
                Other members see the request, tap to pray, and can offer encouragement or relevant scripture.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Celebrate Answers</h3>
              <p className="text-gray-600">
                Request owners can mark prayers as answered, creating testimonies that inspire the whole community.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Ready to Transform Your Church's Prayer Life?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of churches already using the Prayer Wall to strengthen their communities and witness God's faithfulness together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold"
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