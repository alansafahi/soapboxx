import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { ArrowLeft, Mail, MessageCircle, Calendar, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Heart, Clock, BookOpen, Check, Send } from "lucide-react";

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

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    isChurchLeader: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Contact Us - Support & Partnership | SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact SoapBox Super App for technical support, church partnerships, demos, and general inquiries. We\'re here to support your ministry with faith-based technology solutions.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "", isChurchLeader: false });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-700 text-white py-12 sm:py-16 px-4">
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
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Contact Us — We're Here to Support Your Ministry
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-teal-100 max-w-3xl mx-auto px-2">
              Have a question, need support, or want to learn more about SoapBox Super App? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        
        {/* Contact Methods Grid */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Support & Technical Help */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Support & Technical Help
              </h2>
              <p className="text-gray-600 mb-6">
                Need help using the app or reporting an issue?
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Email Support</div>
                    <a href="mailto:support@soapboxsuperapp.com" className="text-blue-600 hover:underline">
                      support@soapboxsuperapp.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Live Chat</div>
                    <div className="text-gray-600 text-sm">Weekdays 9am–5pm PT</div>
                    <div className="text-gray-500 text-xs">(bottom right corner of screen)</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Help Center</div>
                    <a href="#" className="text-blue-600 hover:underline text-sm">
                      Visit Help Docs
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Church Partnerships & Demos */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Church Partnerships & Demos
              </h2>
              <p className="text-gray-600 mb-6">
                Interested in bringing SoapBox Super App to your church or ministry?
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Schedule a Demo</div>
                    <Button
                      onClick={() => window.open('https://www.calendly.com/soapboxsuperapp', '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white mt-2 w-full sm:w-auto min-w-[140px]"
                    >
                      Book a Time
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Talk to Sales</div>
                    <a href="mailto:sales@soapboxsuperapp.com" className="text-green-600 hover:underline">
                      sales@soapboxsuperapp.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* General Inquiries */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <DoveIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                General Inquiries
              </h2>
              <p className="text-gray-600 mb-6">
                For press, partnerships, or anything else:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">General Email</div>
                    <a href="mailto:hello@soapboxsuperapp.com" className="text-purple-600 hover:underline">
                      hello@soapboxsuperapp.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Mailing Address</div>
                    <div className="text-gray-600 text-sm">
                      SoapBox Super App<br />
                      123 FaithTech Way<br />
                      Orcutt, CA 93455<br />
                      USA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-12 sm:mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  We'd love to hear from you and support your ministry journey.
                </p>
              </div>

              {isSubmitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours. Stay blessed!
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-teal-600 hover:bg-teal-700 text-white min-w-[160px]"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="mt-2"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="mt-2"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="mt-2 min-h-[120px]"
                      placeholder="How can we help you and your ministry?"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="church-leader"
                      checked={formData.isChurchLeader}
                      onCheckedChange={(checked) => handleInputChange('isChurchLeader', checked)}
                    />
                    <Label htmlFor="church-leader" className="text-gray-700 font-medium">
                      I am a church leader
                    </Label>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-teal-600 hover:bg-teal-700 text-white w-full py-3 text-lg font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message & Stay Blessed
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Follow Us & Prayer Section */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Follow Us */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Follow Us
              </h2>
              <p className="text-gray-600 mb-6">
                Stay connected and inspired:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Facebook</span>
                </a>
                
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span className="font-medium text-gray-900">Instagram</span>
                </a>
                
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Twitter className="w-5 h-5 text-black" />
                  <span className="font-medium text-gray-900">Twitter / X</span>
                </a>
                
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  <span className="font-medium text-gray-900">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Need Prayer */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <PrayingHandsIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Need Prayer?
              </h2>
              <p className="text-purple-100 mb-6">
                Visit our Prayer Wall and let our community lift you up in prayer.
              </p>
              
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-purple-100 italic text-sm">
                  "For where two or three gather in My name, there am I with them."
                </p>
                <p className="text-purple-200 text-xs mt-2">— Matthew 18:20</p>
              </div>
              
              <Button
                onClick={() => window.location.href = '/features/prayer-wall'}
                className="bg-white text-purple-600 hover:bg-gray-100 w-full min-w-[180px]"
              >
                <Heart className="w-4 h-4 mr-2" />
                Visit Prayer Wall
              </Button>
            </div>
          </div>
        </section>

        {/* Office Hours Info */}
        <section className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Our Mission to Serve You
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our mission is to serve faith communities like yours with technology that empowers connection, prayer, and growth. We're here to support your ministry every step of the way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-teal-600 text-white hover:bg-teal-700 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.location.href = '/login'}
            >
              Start Free Today
            </Button>
            <Button 
              size="lg"
              className="bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
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