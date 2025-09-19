import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

interface TopBarProps {
  onMenuToggle: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { isAuthenticated } = useAuth()

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
            Campus Event Hub
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