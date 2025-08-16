import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  MessageCircle, 
  Book, 
  FileText, 
  Phone, 
  Mail, 
  ExternalLink,
  Search,
  HelpCircle,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import ChatWidget from "../components/ChatWidget";

export default function HelpPage() {
  const [showChat, setShowChat] = useState(false);

  const supportOptions = [
    {
      title: "Live Chat Support",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: () => setShowChat(true),
      badge: "Available Now",
      badgeVariant: "success" as const
    },
    {
      title: "Help Documentation",
      description: "Browse our comprehensive guides and tutorials",
      icon: Book,
      href: "/help-docs",
      badge: "Self-Service",
      badgeVariant: "secondary" as const
    },
    {
      title: "Frequently Asked Questions",
      description: "Quick answers to common questions",
      icon: HelpCircle,
      href: "/faq",
      badge: "Popular",
      badgeVariant: "secondary" as const
    },
    {
      title: "Contact Support",
      description: "Send us a message and we'll get back to you",
      icon: Mail,
      href: "/contact-us",
      badge: "Email Support",
      badgeVariant: "secondary" as const
    }
  ];

  const quickLinks = [
    { title: "Getting Started Guide", href: "/help-docs" },
    { title: "Community Guidelines", href: "/help-docs#community" },
    { title: "Prayer Request Help", href: "/help-docs#prayer" },
    { title: "SOAP Journaling Guide", href: "/help-docs#soap" },
    { title: "Account Settings", href: "/settings" },
    { title: "Privacy & Security", href: "/help-docs#privacy" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Help & Support Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're here to help you get the most out of SoapBox. Choose from the support options below.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <Badge variant={option.badgeVariant} className="mx-auto">
                    {option.badge}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="mb-4">
                    {option.description}
                  </CardDescription>
                  {option.href ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={option.href}>
                        Get Help
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={option.action}
                    >
                      Start Chat
                      <MessageCircle className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Support Hours */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Support Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                  Live Chat Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Monday - Friday: 9:00 AM - 5:00 PM PT<br />
                  Weekend: Limited availability
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  24/7 - We typically respond within 24 hours<br />
                  Priority support for urgent issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Quick Links
            </CardTitle>
            <CardDescription>
              Common help topics and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <div className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <FileText className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">{link.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <div className="mt-8 text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Need Urgent Help?
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            For urgent technical issues affecting your community or critical functionality
          </p>
          <Button variant="destructive" asChild>
            <a href="mailto:support@soapboxsuperapp.com?subject=URGENT%20Support%20Request">
              <Mail className="w-4 h-4 mr-2" />
              Emergency Contact
            </a>
          </Button>
        </div>
      </div>

      {/* Integrated Chat Widget */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Live Support Chat</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)}
              >
                ×
              </Button>
            </div>
            <div className="h-96">
              <ChatWidget position="bottom-right" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}