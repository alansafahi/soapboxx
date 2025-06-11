import { Button } from "@/components/ui/button";
import soapboxLogo from "@assets/SoapBx logo_1749625213720.jpeg";

export default function SimpleLanding() {
  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={soapboxLogo} 
              alt="SoapBox Logo" 
              style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              SoapBox Super App
            </span>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Connect with Your <span style={{ color: '#2563eb' }}>Faith Community</span>
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280', 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6'
          }}>
            Join a platform that brings together believers, churches, and communities through 
            meaningful engagement, prayer, and spiritual growth.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '48px',
            color: '#111827'
          }}>
            Everything Your Faith Community Needs
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            <div style={{ 
              background: 'white', 
              padding: '32px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
                Prayer & Devotions
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Share prayer requests, join prayer circles, and access daily devotionals 
                to strengthen your spiritual journey.
              </p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '32px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
                Community Events
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Discover and participate in church events, volunteer opportunities, 
                and community gatherings.
              </p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '32px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
                Bible Study
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Read, study, and discuss scripture with interactive Bible reading 
                plans and community discussions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '80px 24px', 
        background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '24px' 
          }}>
            Ready to Join Your Faith Community?
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#bfdbfe', 
            marginBottom: '32px' 
          }}>
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
      <footer style={{ 
        background: '#111827', 
        color: 'white', 
        padding: '48px 24px', 
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <img 
              src={soapboxLogo} 
              alt="SoapBox Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>SoapBox Super App</span>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
            Connecting faith communities through modern technology
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            © 2025 SoapBox Super App. Built with faith and community in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}