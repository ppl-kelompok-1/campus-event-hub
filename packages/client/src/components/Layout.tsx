import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <header style={{ 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <nav style={{ 
          maxWidth: '100%', 
          margin: '0 auto',
          padding: '0 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px'
        }}>
          {/* Logo / Brand */}
          <Link to="/" style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            Campus Event Hub
          </Link>

          {/* Navigation Links */}
          <ul style={{ 
            display: 'flex', 
            listStyle: 'none', 
            gap: '30px', 
            margin: 0,
            padding: 0,
            alignItems: 'center'
          }}>
            <li>
              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: isActive('/') ? '#007bff' : '#666',
                  fontWeight: isActive('/') ? 'bold' : 'normal'
                }}
              >
                Home
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li>
                  <Link 
                    to="/profile" 
                    style={{ 
                      textDecoration: 'none', 
                      color: isActive('/profile') ? '#007bff' : '#666',
                      fontWeight: isActive('/profile') ? 'bold' : 'normal'
                    }}
                  >
                    Profile
                  </Link>
                </li>
                
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <li>
                    <Link 
                      to="/users" 
                      style={{ 
                        textDecoration: 'none', 
                        color: location.pathname.startsWith('/users') ? '#007bff' : '#666',
                        fontWeight: location.pathname.startsWith('/users') ? 'bold' : 'normal'
                      }}
                    >
                      Users
                    </Link>
                  </li>
                )}
                
                <li style={{ 
                  borderLeft: '1px solid #dee2e6', 
                  paddingLeft: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <span style={{ color: '#666' }}>
                    {user?.name} ({user?.role})
                  </span>
                  <button 
                    onClick={logout}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login">
                  <button style={{
                    padding: '8px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    Login
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        maxWidth: '98%',
        margin: '0 auto',
        padding: '40px 1%',
        width: '100%'
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>&copy; 2025 Campus Event Hub. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout