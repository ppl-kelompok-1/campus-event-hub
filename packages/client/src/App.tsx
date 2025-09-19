import { Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Profile from './pages/Profile'
import UsersPage from './pages/UsersPage'
import CreateUserPage from './pages/CreateUserPage'
import EditUserPage from './pages/EditUserPage'
import UpdateProfilePage from './pages/UpdateProfilePage'
import './App.css'

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth()
  
  return (
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '20px', padding: '20px' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/update-profile">Update Profile</Link>
            </li>
            
            {/* Admin menu */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <li>
                <Link to="/users">Users</Link>
              </li>
            )}
            
            <li style={{ marginLeft: 'auto' }}>
              <span>Hello, {user?.name}</span>
              <button onClick={logout} style={{ marginLeft: '10px' }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li style={{ marginLeft: 'auto' }}>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <div>
        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-profile"
            element={
              <ProtectedRoute>
                <UpdateProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/create"
            element={
              <ProtectedRoute>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute>
                <EditUserPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
