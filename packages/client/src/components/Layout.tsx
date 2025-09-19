import { useState } from 'react'
import type { ReactNode } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import { useAuth } from '../auth/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <TopBar onMenuToggle={handleMenuToggle} />

      {/* Sidebar - Only for authenticated users */}
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      )}

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