import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path || 
    (path === '/users' && location.pathname.startsWith('/users')) ||
    (path === '/events/my' && location.pathname.startsWith('/events/my')) ||
    (path === '/events/create' && location.pathname.startsWith('/events/create')) ||
    (path === '/approvals' && location.pathname.startsWith('/approvals'))

  const handleNavigation = () => {
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      onClose()
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h3>Campus Event Hub</h3>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* User Profile Section - Only for authenticated users */}
        {isAuthenticated && user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {/* General Section */}
          <div className="nav-section">
            <div className="nav-section-title">General</div>
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'nav-item-active' : ''}`}
              onClick={handleNavigation}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </Link>
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className={`nav-item ${isActive('/profile') ? 'nav-item-active' : ''}`}
                onClick={handleNavigation}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">Profile</span>
              </Link>
            )}
            {!isAuthenticated && (
              <Link 
                to="/login" 
                className={`nav-item ${isActive('/login') ? 'nav-item-active' : ''}`}
                onClick={handleNavigation}
              >
                <span className="nav-icon">🔑</span>
                <span className="nav-text">Login</span>
              </Link>
            )}
          </div>

          {/* Events Section */}
          <div className="nav-section">
            <div className="nav-section-title">Events</div>
            <Link 
              to="/events" 
              className={`nav-item ${isActive('/events') && !location.pathname.includes('/events/') ? 'nav-item-active' : ''}`}
              onClick={handleNavigation}
            >
              <span className="nav-icon">📅</span>
              <span className="nav-text">Browse Events</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/events/my" 
                  className={`nav-item ${isActive('/events/my') ? 'nav-item-active' : ''}`}
                  onClick={handleNavigation}
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">My Events</span>
                </Link>
                <Link 
                  to="/events/create" 
                  className={`nav-item ${isActive('/events/create') ? 'nav-item-active' : ''}`}
                  onClick={handleNavigation}
                >
                  <span className="nav-icon">➕</span>
                  <span className="nav-text">Create Event</span>
                </Link>
              </>
            )}
          </div>

          {/* Approval Section - Approver/Admin/Superadmin only */}
          {isAuthenticated && (user?.role === 'approver' || user?.role === 'admin' || user?.role === 'superadmin') && (
            <div className="nav-section">
              <div className="nav-section-title">Approvals</div>
              <Link 
                to="/approvals" 
                className={`nav-item ${isActive('/approvals') ? 'nav-item-active' : ''}`}
                onClick={handleNavigation}
              >
                <span className="nav-icon">✅</span>
                <span className="nav-text">Pending Approvals</span>
              </Link>
            </div>
          )}

          {/* Administration Section - Admin/Superadmin only */}
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin') && (
            <div className="nav-section">
              <div className="nav-section-title">Administration</div>
              <Link 
                to="/users" 
                className={`nav-item ${isActive('/users') ? 'nav-item-active' : ''}`}
                onClick={handleNavigation}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Manage Users</span>
              </Link>
            </div>
          )}

          {/* Account Section - Only for authenticated users */}
          {isAuthenticated && (
            <div className="nav-section">
              <div className="nav-section-title">Account</div>
              <button 
                className="nav-item nav-button"
                onClick={handleLogout}
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}

export default Sidebar