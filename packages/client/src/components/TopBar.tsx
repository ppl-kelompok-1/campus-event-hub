import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

interface TopBarProps {
  onMenuToggle: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Left Section - Menu Button */}
        <div className="topbar-left">
          {isAuthenticated && (
            <button 
              className="menu-toggle"
              onClick={onMenuToggle}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}
        </div>

        {/* Center Section - Logo/Brand */}
        <div className="topbar-center">
          <Link to="/" className="topbar-logo">
            Campus Event Hub
          </Link>
        </div>

        {/* Right Section - User Info or Login */}
        <div className="topbar-right">
          {isAuthenticated ? (
            <Link to="/profile" className="topbar-user">
              <div className="topbar-user-avatar">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-user-info">
                <div className="topbar-user-name">{user?.name}</div>
                <div className="topbar-user-role">{user?.role}</div>
              </div>
            </Link>
          ) : (
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