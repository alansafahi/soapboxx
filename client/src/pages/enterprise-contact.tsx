import { useState } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Building2, Users, Mail, Phone, MessageSquare, User, Briefcase, Star, Sparkles, MapPin } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function EnterpriseContact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    churchName: "",
    cityState: "",
    numberOfCampuses: "",
    congregationSize: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow digits, spaces, hyphens, parentheses, and plus
    if (name === 'phone') {
      const cleanedPhone = value.replace(/[^\d\s\-\(\)\+]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleanedPhone
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.name.trim() || !formData.title.trim() || !formData.email.trim() || 
        !formData.churchName.trim() || !formData.cityState.trim() || 
        !formData.numberOfCampuses || !formData.congregationSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enterprise-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          title: formData.title,
          email: formData.email,
          phone: formData.phone,
          churchName: formData.churchName,
          cityState: formData.cityState,
          numberOfCampuses: formData.numberOfCampuses,
          congregationSize: formData.congregationSize,
          message: formData.message
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent Successfully! 🙏",
          description: data.message || "Our enterprise sales team will contact you within 24 hours.",
          variant: "default",
        });
        // Reset form
        setFormData({
          name: "",
          title: "",
          email: "",
          phone: "",
          churchName: "",
          cityState: "",
          numberOfCampuses: "",
          congregationSize: "",
          message: ""
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again or email us directly at sales@soapboxsuperapp.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Enterprise Sales
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let's discuss custom solutions to transform your ministry and empower your congregation
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">Custom enterprise pricing and white-glove onboarding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl opacity-30 -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center space-x-1 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Transform Your Ministry?</h2>
              <p className="text-gray-600 text-lg">Fill out the form below and our team will reach out within 24 hours with a custom solution</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      Title/Position *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                      placeholder="Pastor, Administrator, Executive Pastor, etc."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                      placeholder="your@church.org"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <Phone className="w-4 h-4 text-orange-600" />
                      </div>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Ministry Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Ministry Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="churchName" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        Church/Organization Name *
                      </label>
                      <input
                        type="text"
                        id="churchName"
                        name="churchName"
                        required
                        value={formData.churchName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        placeholder="First Baptist Church, Grace Community, etc."
                      />
                    </div>

                    <div>
                      <label htmlFor="cityState" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        </div>
                        City, State *
                      </label>
                      <input
                        type="text"
                        id="cityState"
                        name="cityState"
                        required
                        value={formData.cityState}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        placeholder="Dallas, TX or Los Angeles, CA"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="numberOfCampuses" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-4 h-4 text-violet-600" />
                        </div>
                        Number of Campuses *
                      </label>
                      <select
                        id="numberOfCampuses"
                        name="numberOfCampuses"
                        required
                        value={formData.numberOfCampuses}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                      >
                        <option value="">Select number of campuses</option>
                        <option value="1">1 Campus (Single Location)</option>
                        <option value="2">2 Campuses</option>
                        <option value="3">3 Campuses</option>
                        <option value="4">4 Campuses</option>
                        <option value="5">5 Campuses</option>
                        <option value="6-10">6-10 Campuses</option>
                        <option value="11-20">11-20 Campuses</option>
                        <option value="21+">21+ Campuses</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="congregationSize" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-teal-600" />
                        </div>
                        Total Congregation Size *
                      </label>
                      <select
                        id="congregationSize"
                        name="congregationSize"
                        required
                        value={formData.congregationSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                      >
                        <option value="">Select total congregation size</option>
                        <option value="250-500">250-500 members</option>
                        <option value="500-1000">500-1,000 members</option>
                        <option value="1000-2500">1,000-2,500 members</option>
                        <option value="2500-5000">2,500-5,000 members</option>
                        <option value="5000+">5,000+ members</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                      <MessageSquare className="w-4 h-4 text-pink-600" />
                    </div>
                    Tell Us About Your Needs
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      maxLength={1500}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 pb-8 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300 resize-none"
                      placeholder="Share your specific needs, timeline, current challenges, or questions about how SoapBox can transform your ministry. Include any technical requirements, integration needs, or special considerations for your congregation..."
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                      {formData.message.length}/1500
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Contact Enterprise Sales</span>
                    </div>
                  )}
                </Button>
                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    ⚡ We'll respond within 24 hours
                  </p>
                  <p className="text-xs text-gray-500">
                    Direct line: <a href="mailto:sales@soapboxsuperapp.com" className="text-purple-600 hover:text-purple-700 underline">sales@soapboxsuperapp.com</a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}