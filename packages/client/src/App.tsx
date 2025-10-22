import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import PublicUserProfilePage from './pages/PublicUserProfilePage'
import UsersPage from './pages/UsersPage'
import CreateUserPage from './pages/CreateUserPage'
import EditUserPage from './pages/EditUserPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import EditEventPage from './pages/EditEventPage'
import EventDetailsPage from './pages/EventDetailsPage'
import PendingApprovalsPage from './pages/PendingApprovalsPage'
import LocationManagementPage from './pages/LocationManagementPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Layout>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Event routes - public */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          
          {/* Public user profile routes */}
          <Route path="/users/:id/profile" element={<PublicUserProfilePage />} />
          
          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* Event routes - protected */}
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/edit/:id"
            element={
              <ProtectedRoute>
                <EditEventPage />
              </ProtectedRoute>
            }
          />
          
          {/* Approver routes */}
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <PendingApprovalsPage />
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

          {/* Location management route - admin only */}
          <Route
            path="/locations"
            element={
              <ProtectedRoute>
                <LocationManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Settings route - superadmin only */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Layout>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
