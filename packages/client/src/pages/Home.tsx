import { useNavigate } from 'react-router-dom'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../auth/AuthContext'

const Home = () => {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { isAuthenticated, user } = useAuth()

  const handleExploreEvents = () => {
    navigate('/events')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Hero Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          {/* Welcome Message */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Welcome to {settings?.siteTitle || 'Campus Event Hub'}
          </h1>

          {/* Personalized Greeting for Authenticated Users */}
          {isAuthenticated && user && (
            <p style={{
              fontSize: '20px',
              color: '#007bff',
              marginBottom: '24px',
              fontWeight: '500'
            }}>
              Hello, {user.name}! 👋
            </p>
          )}

          {/* Description */}
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}>
            Discover and join exciting events happening on campus. Connect with your community,
            explore new opportunities, and make the most of your campus experience.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleExploreEvents}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,123,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.2)'
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(0,123,255,0.2)'
            }}
          >
            Explore Events →
          </button>
        </div>

        {/* Feature Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Feature 1 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              Browse Events
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: '1.5',
              margin: 0
            }}>
              Discover a wide range of events tailored to your interests and schedule
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              Easy Registration
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: '1.5',
              margin: 0
            }}>
              Register for events with just a click and manage your attendance seamlessly
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌟</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              {isAuthenticated ? 'Create Events' : 'Stay Connected'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: '1.5',
              margin: 0
            }}>
              {isAuthenticated
                ? 'Organize your own events and bring your community together'
                : 'Never miss out on exciting opportunities happening around campus'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
