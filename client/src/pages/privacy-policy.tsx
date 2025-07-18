import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy - SoapBox Super App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'SoapBox Super App Privacy Policy - Learn how we collect, use, and protect your personal information in our faith community platform.');
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
              SoapBox Super App Privacy Policy
            </h1>
            <p className="text-gray-600">Last updated July 18, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              This Privacy Policy outlines how SoapBox, SoapBox App or SoapBox Super App ("we," "our," or "us") collect and use our user's ("you" or "your") personal information, which we gather from our websites, services, and desktop and mobile applications (collectively referred to as "SoapBox"). We are committed and strive to ensure that any personal information we collect about you will be held and processed strictly in accordance with applicable data protection legislation, as set out in this Privacy Policy.
            </p>

            <p className="text-gray-700 mb-6">
              This Privacy Policy also describes the choices you have regarding personal information we've collected about you.
            </p>

            <p className="text-gray-700 mb-6">
              Data processed by SoapBox can be classified in two ways:
            </p>

            <ol className="list-decimal list-inside mb-6 text-gray-700">
              <li>Data that has been collected by us for our own purposes; and</li>
              <li>Data collected by our users and used for their purposes. For example, your church may collect data about you and use this data to communicate with you.</li>
            </ol>

            <p className="text-gray-700 mb-6">
              This Privacy Policy specifically covers data that is collected by us. We are not responsible for, nor do we have control over, the use of data that is collected by users of SoapBox. Under applicable data protection laws, we are a Data Processor under the GDPR or a Service Provider under CPRA and your organization is the Data Controller under the GDPR or the Business under CPRA.
            </p>

            <p className="text-gray-700 mb-8">
              Information about the privacy and security of our customer's data is available online at <a href="https://www.soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">www.soapboxsuperapp.com</a>.
            </p>

            <p className="text-gray-700 mb-8">
              By using SoapBox, you agree to the collection and use of your personal information in accordance with this Privacy Policy. Terms used in this Privacy Policy have the same meanings as in our Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Collect Personal Information</h2>
            
            <p className="text-gray-700 mb-6">
              We collect several different types of personal information, which we use as described in this Privacy Policy. For instance, we collect data:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">During signup</h3>
            
            <p className="text-gray-700 mb-4">
              When you sign up for SoapBox, we ask you to provide us with the following personal data:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Identifiers, such as your name, email, or other similar identifiers</li>
              <li>Categories of personal information described in Section 1798.80(e) of the California Civil Code, such as your first and last name, or the organization you're affiliated with</li>
              <li>Inferences drawn from the above categories of personal information</li>
            </ul>

            <p className="text-gray-700 mb-6">
              We use this information for creating and administering your account. We also may use this information to contact you and send you newsletters, marketing or promotional materials, or other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us by clicking on the unsubscribe link in the emails, or by contacting our support team at <a href="mailto:support@soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">support@soapboxsuperapp.com</a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Automatically while you are using SoapBox</h3>
            
            <p className="text-gray-700 mb-6">
              We also automatically collect information on how SoapBox is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages that you use/visit, the time and date of your visit or use, the time spent on those pages or features of SoapBox, unique device identifiers and other diagnostic data. We use this data to analyze SoapBox's performance and make our services more effective.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Through the use of our Website</h3>
            
            <p className="text-gray-700 mb-6">
              When you use our website, we use cookies and similar tracking technologies to track the activity on the SoapBox website and we retain this information to provide and improve the website.
            </p>

            <p className="text-gray-700 mb-6">
              Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Other tracking technologies are also used such as beacons, tags and scripts to collect and track information and to improve and analyze SoapBox.
            </p>

            <p className="text-gray-700 mb-6">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of SoapBox.
            </p>

            <h4 className="text-lg font-semibold text-gray-900 mb-3">Cookie Types:</h4>
            
            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> These cookies are essential to provide you with SoapBox. For example, they allow you to log in.</li>
              <li><strong>Functionality Cookies:</strong> These cookies allow us to remember choices you make, or to provide certain features, such as enabling videos from third parties.</li>
              <li><strong>Analytics and Performance Cookies:</strong> These cookies are used to collect information about traffic to our services and how users use our services.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">When you choose to provide us with information</h3>
            
            <p className="text-gray-700 mb-8">
              You may choose to provide us with personal information while interacting with us in various ways. For example, when you submit a request for help. This information is only used for the purposes for which it was provided.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Personal Information</h2>
            
            <p className="text-gray-700 mb-4">We use collected information for the following general purposes:</p>
            
            <ul className="list-disc list-inside mb-8 text-gray-700 space-y-1">
              <li>To provide and maintain SoapBox</li>
              <li>To notify you about changes to SoapBox</li>
              <li>To allow you to participate in features of SoapBox</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve SoapBox</li>
              <li>To detect, prevent and address technical issues</li>
              <li>For billing and tax purposes</li>
              <li>To identify and authenticate users</li>
              <li>To prevent fraud and spam</li>
              <li>To provide you with products or services you have requested, such as newsletters</li>
              <li>To communicate special offers and information that we think may be of interest to you</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclosure and Sharing of Data</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Providers</h3>
            
            <p className="text-gray-700 mb-4">
              We share information with third parties who provide services on our behalf to help with our business activities and to provide SoapBox. These companies are authorized to use your personal information for the sole purpose of providing services to us. These services include:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
              <li>Fulfilling orders</li>
              <li>Processing payments</li>
              <li>Providing customer service</li>
              <li>Sending marketing communications</li>
              <li>Fulfilling subscription services</li>
              <li>Conducting product research and analysis</li>
              <li>Providing and maintaining a cloud computing environment</li>
              <li>Fixing bugs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Transaction</h3>
            
            <p className="text-gray-700 mb-6">
              If we are involved in a merger, acquisition or asset sale, your personal information may be transferred. We will provide notice before your personal information is transferred and becomes subject to a different Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Requirements</h3>
            
            <p className="text-gray-700 mb-4">
              We may disclose your personal information in the good faith belief that such action is necessary to:
            </p>

            <ul className="list-disc list-inside mb-8 text-gray-700 space-y-1">
              <li>To comply with a legal obligation</li>
              <li>To protect and defend the rights or property of our company</li>
              <li>To prevent or investigate possible wrongdoing in connection with SoapBox</li>
              <li>To protect the personal safety of users of SoapBox or the public</li>
              <li>To protect against legal liability</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Features and Data Processing</h2>
            
            <p className="text-gray-700 mb-4">
              SoapBox Super App uses artificial intelligence to enhance your spiritual experience, including:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
              <li>AI-powered sermon preparation and biblical research assistance</li>
              <li>Scripture study enhancement and devotional content generation</li>
              <li>Prayer assistance and spiritual guidance through chat features</li>
              <li>Content analysis for community moderation and engagement insights</li>
              <li>Personalized spiritual growth recommendations and analytics</li>
            </ul>

            <p className="text-gray-700 mb-4">
              When you use AI-powered features, your inputs may be processed by third-party AI services (such as OpenAI) to provide these services. We:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
              <li>Do not store personal prayer requests or private journal entries on external AI servers</li>
              <li>Process only the minimum necessary data to provide AI functionality</li>
              <li>Use anonymized data when possible for AI training and improvement</li>
              <li>Require our AI service providers to maintain strict data protection standards</li>
              <li>Allow you to opt out of AI features while maintaining access to core platform functionality</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security of Data</h2>
            
            <p className="text-gray-700 mb-6">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. If you have any questions about the security of your personal information, you can contact us at <a href="mailto:support@soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">support@soapboxsuperapp.com</a>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            
            <p className="text-gray-700 mb-6">
              Upon request, we will provide you with information about your personal information. You may request access, correct, request the deletion of, or object to our use of your personal information by contacting us at <a href="mailto:support@soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">support@soapboxsuperapp.com</a>. If you email us, please include "Personal Information Inquiry" as the subject line.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> <a href="mailto:support@soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">support@soapboxsuperapp.com</a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Website:</strong> <a href="https://www.soapboxsuperapp.com" className="text-purple-600 hover:text-purple-800">www.soapboxsuperapp.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Mailing Address:</strong><br />
                SoapBox Super App<br />
                1130 E. Clark Street, #150-204<br />
                Orcutt, CA 93455<br />
                USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}