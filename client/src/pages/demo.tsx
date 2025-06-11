import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Users, Heart } from "lucide-react";
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

export default function DemoPage() {
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
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <SoapBoxLogo />
            
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Schedule Your Personalized Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            See how SoapBox Super App can transform your faith community's digital experience. 
            Our team will show you exactly how our platform fits your unique needs.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">30-Minute Session</h3>
              <p className="text-gray-600 text-sm">Focused demo tailored to your community's specific needs and challenges.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-gray-600 text-sm">Learn from specialists who understand faith community technology needs.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">No Pressure</h3>
              <p className="text-gray-600 text-sm">Educational session focused on helping you make the best decision for your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section className="pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Request Your Demo
            </h2>
            
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
              <br />
              <span className="text-gray-500">No spam, we promise!</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}