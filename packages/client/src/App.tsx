import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
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
import UserManualIndexPage from './pages/UserManualIndexPage'
import LoginGuidePage from './pages/user-manual/getting-started/LoginGuidePage'
import ForgotPasswordGuidePage from './pages/user-manual/getting-started/ForgotPasswordPage'
import ResetPasswordGuidePage from './pages/user-manual/getting-started/ResetPasswordPage'
import UsingPaginationPage from './pages/user-manual/getting-started/UsingPaginationPage'
import ViewingProfilePage from './pages/user-manual/users/ViewingProfilePage'
import UpdatingProfilePage from './pages/user-manual/users/UpdatingProfilePage'
import RegisteringEventsPage from './pages/user-manual/users/RegisteringEventsPage'
import UnregisteringEventsPage from './pages/user-manual/users/UnregisteringEventsPage'
import ExportingEventsPage from './pages/user-manual/users/ExportingEventsPage'
import CreatingEventPage from './pages/user-manual/event-creators/CreatingEventPage'
import UploadingAttachmentsPage from './pages/user-manual/event-creators/UploadingAttachmentsPage'
import ManagingCapacityPage from './pages/user-manual/event-creators/ManagingCapacityPage'
import SubmittingEventPage from './pages/user-manual/event-creators/SubmittingEventPage'
import EditingEventPage from './pages/user-manual/event-creators/EditingEventPage'
import DeletingEventPage from './pages/user-manual/event-creators/DeletingEventPage'
import CancelingEventPage from './pages/user-manual/event-creators/CancelingEventPage'
import SendingMessagesPage from './pages/user-manual/event-creators/SendingMessagesPage'
import ExportingAttendeesPage from './pages/user-manual/event-creators/ExportingAttendeesPage'
import ApprovingEventPage from './pages/user-manual/approvers/ApprovingEventPage'
import RequestingRevisionPage from './pages/user-manual/approvers/RequestingRevisionPage'
import PublishingDirectlyPage from './pages/user-manual/approvers/PublishingDirectlyPage'
import CreatingUserPage from './pages/user-manual/administrators/CreatingUserPage'
import CreatingLocationPage from './pages/user-manual/administrators/CreatingLocationPage'
import TogglingLocationPage from './pages/user-manual/administrators/TogglingLocationPage'
import UpdatingSettingsPage from './pages/user-manual/superadministrators/UpdatingSettingsPage'
import UploadingLogoPage from './pages/user-manual/superadministrators/UploadingLogoPage'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Layout>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Event routes - public */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          
          {/* Public user profile routes */}
          <Route path="/users/:id/profile" element={<PublicUserProfilePage />} />

          {/* User Manual - public */}
          <Route path="/user-manual" element={<UserManualIndexPage />} />
          <Route path="/user-manual/getting-started/login" element={<LoginGuidePage />} />
          <Route path="/user-manual/getting-started/forgot-password" element={<ForgotPasswordGuidePage />} />
          <Route path="/user-manual/getting-started/reset-password" element={<ResetPasswordGuidePage />} />
          <Route path="/user-manual/getting-started/using-pagination" element={<UsingPaginationPage />} />
          <Route path="/user-manual/users/viewing-profile" element={<ViewingProfilePage />} />
          <Route path="/user-manual/users/updating-profile" element={<UpdatingProfilePage />} />
          <Route path="/user-manual/users/registering-events" element={<RegisteringEventsPage />} />
          <Route path="/user-manual/users/unregistering-events" element={<UnregisteringEventsPage />} />
          <Route path="/user-manual/users/exporting-events" element={<ExportingEventsPage />} />
          <Route path="/user-manual/event-creators/creating-event" element={<CreatingEventPage />} />
          <Route path="/user-manual/event-creators/uploading-attachments" element={<UploadingAttachmentsPage />} />
          <Route path="/user-manual/event-creators/managing-capacity" element={<ManagingCapacityPage />} />
          <Route path="/user-manual/event-creators/submitting-event" element={<SubmittingEventPage />} />
          <Route path="/user-manual/event-creators/editing-event" element={<EditingEventPage />} />
          <Route path="/user-manual/event-creators/deleting-event" element={<DeletingEventPage />} />
          <Route path="/user-manual/event-creators/canceling-event" element={<CancelingEventPage />} />
          <Route path="/user-manual/event-creators/sending-messages" element={<SendingMessagesPage />} />
          <Route path="/user-manual/event-creators/exporting-attendees" element={<ExportingAttendeesPage />} />
          <Route path="/user-manual/approvers/approving-event" element={<ApprovingEventPage />} />
          <Route path="/user-manual/approvers/requesting-revision" element={<RequestingRevisionPage />} />
          <Route path="/user-manual/approvers/publishing-directly" element={<PublishingDirectlyPage />} />
          <Route path="/user-manual/administrators/creating-user" element={<CreatingUserPage />} />
          <Route path="/user-manual/administrators/creating-location" element={<CreatingLocationPage />} />
          <Route path="/user-manual/administrators/toggling-location" element={<TogglingLocationPage />} />
          <Route path="/user-manual/superadministrators/updating-settings" element={<UpdatingSettingsPage />} />
          <Route path="/user-manual/superadministrators/uploading-logo" element={<UploadingLogoPage />} />

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
