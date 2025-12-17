import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { SERVER_BASE_URL } from '../auth/api'

interface TopBarProps {
  onMenuToggle: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { isAuthenticated } = useAuth()
  const { settings } = useSettings()

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Left Section - Menu Button */}
        <div className="topbar-left">
          <button 
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Center Section - Logo/Brand */}
        <div className="topbar-center">
          <Link to="/" className="topbar-logo">
            {settings?.siteLogoUrl ? (
              <div className="topbar-logo-with-image">
                <img
                  src={`${SERVER_BASE_URL}${settings.siteLogoUrl}`}
                  alt={settings?.siteTitle || 'Campus Event Hub'}
                  className="topbar-logo-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="topbar-logo-text">
                  {settings?.siteTitle || 'Campus Event Hub'}
                </span>
              </div>
            ) : (
              <span>{settings?.siteTitle || 'Campus Event Hub'}</span>
            )}
          </Link>
        </div>

        {/* Right Section - Login for guests only */}
        <div className="topbar-right">
          {!isAuthenticated && (
            <Link to="/login" className="topbar-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar