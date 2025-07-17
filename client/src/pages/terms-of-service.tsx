import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service - SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'SoapBox Super App Terms of Service - Review our terms and conditions for using our faith community platform and digital ministry tools.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SoapBox Super App Terms of Service
            </h1>
            <p className="text-gray-600">Last updated April 14, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Welcome to SoapBox Super App! These Terms of Service ("Terms") govern your use of the SoapBox Super App platform, website, and services (collectively, the "Service") operated by SoapBox Super App ("we," "us," or "our").
            </p>

            <p className="text-gray-700 mb-8">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            
            <p className="text-gray-700 mb-6">
              By creating an account or using SoapBox Super App, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and SoapBox Super App.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            
            <p className="text-gray-700 mb-4">
              SoapBox Super App is a digital ministry platform that provides:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li>Prayer wall and community prayer features</li>
              <li>Bible study tools and S.O.A.P. journaling</li>
              <li>Church event management and communication</li>
              <li>Community discussion forums and social features</li>
              <li>Volunteer coordination and ministry management</li>
              <li>Digital outreach and content distribution tools</li>
              <li>Analytics and engagement tracking for church leadership</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            
            <p className="text-gray-700 mb-4">
              To use certain features of our Service, you must create an account. You agree to:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            
            <p className="text-gray-700 mb-4">
              You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li>Post content that is unlawful, harmful, threatening, abusive, or offensive</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Upload viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to our systems or user accounts</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Post content that infringes on intellectual property rights</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Content</h3>
            
            <p className="text-gray-700 mb-4">
              You retain ownership of any content you post on our Service. However, by posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display your content in connection with operating and providing the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Content</h3>
            
            <p className="text-gray-700 mb-6">
              The Service and its original content, features, and functionality are owned by SoapBox Super App and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment and Subscription Terms</h2>
            
            <p className="text-gray-700 mb-4">
              Our Service offers both free and paid features:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li>Free accounts have access to basic community features</li>
              <li>Paid subscriptions provide access to advanced features and analytics</li>
              <li>Church subscriptions include additional administrative tools</li>
              <li>Payments are processed securely through third-party payment processors</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Refunds are handled according to our refund policy</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            
            <p className="text-gray-700 mb-6">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. We implement appropriate security measures to protect your personal information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the Service at our discretion, without notice, for:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of subscription fees</li>
              <li>Prolonged inactivity</li>
            </ul>

            <p className="text-gray-700 mb-6">
              You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
            
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li>Warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties of non-infringement</li>
              <li>Warranties regarding the accuracy, reliability, or availability of the Service</li>
            </ul>

            <p className="text-gray-700 mb-6">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            
            <p className="text-gray-700 mb-6">
              You agree to indemnify and hold harmless SoapBox Super App, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>
            
            <p className="text-gray-700 mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising under these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:support@soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">support@soapboxsuperapp.com</a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Website:</strong> <a href="https://www.soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">www.soapboxsuperapp.com</a>
              </p>
            </div>

            <div className="mt-8 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-purple-800 font-semibold">
                By using SoapBox Super App, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}