import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { authApi, eventApi } from '../auth/api'
import type { Event, UserCategory } from '../auth/api'
import EventsTable from '../components/EventsTable'
import { useNavigate, useLocation } from 'react-router-dom'
import { setUser } from '../auth/storage'

interface JoinedEventRegistration {
  id: number
  eventId: number
  userId: number
  userName: string
  userEmail: string
  registrationDate: string
  status: 'registered' | 'waitlisted' | 'cancelled'
  createdAt: string
  updatedAt: string
}

const getCategoryBadgeColor = (category: UserCategory): string => {
  switch (category) {
    case 'mahasiswa':
      return '#007bff' // Blue
    case 'dosen':
      return '#28a745' // Green
    case 'staff':
      return '#ffc107' // Yellow/Gold
    default:
      return '#6c757d' // Gray
  }
}

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Tab state - check URL parameters for initial tab
  const searchParams = new URLSearchParams(location.search)
  const urlTab = searchParams.get('tab') as 'created' | 'joined' | null
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>(urlTab || 'created')
  
  // Events state
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [joinedRegistrations, setJoinedRegistrations] = useState<JoinedEventRegistration[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  // Update tab when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlTab = searchParams.get('tab') as 'created' | 'joined' | null
    if (urlTab && (urlTab === 'created' || urlTab === 'joined')) {
      setActiveTab(urlTab)
    }
  }, [location.search])

  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      setEventsError('')
      
      // Fetch created events
      const createdResponse = await eventApi.getMyEvents()
      setCreatedEvents(createdResponse.data)
      
      // Fetch joined events
      const joinedResponse = await eventApi.getJoinedEvents()
      setJoinedRegistrations(joinedResponse.data)
      
      // Get full event details for each registration
      const eventPromises = joinedResponse.data.map(reg => 
        eventApi.getEventById(reg.eventId)
      )
      
      const eventResponses = await Promise.all(eventPromises)
      const eventsData = eventResponses
        .filter(response => response.data)
        .map(response => {
          const event = response.data!
          
          // Find the corresponding registration for this event
          const registration = joinedResponse.data.find(reg => reg.eventId === event.id)
          
          // Merge registration status with event data
          if (registration) {
            return {
              ...event,
              isUserRegistered: true,
              userRegistrationStatus: registration.status,
              canRegister: false
            }
          }
          
          return event
        })
        
      // Sort events by nearest date first
      const sortedEvents = eventsData.sort((a, b) => {
        const dateA = new Date(a.eventDate)
        const dateB = new Date(b.eventDate)
        const now = new Date()
        
        const diffA = Math.abs(dateA.getTime() - now.getTime())
        const diffB = Math.abs(dateB.getTime() - now.getTime())
        
        return diffA - diffB
      })
      
      setJoinedEvents(sortedEvents)
    } catch (err) {
      setEventsError('Failed to load events. Please try again later.')
      console.error('Error fetching events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setName(user?.name || '')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setName(user?.name || '')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate passwords match
    if (password && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Only send fields that have been changed
      const updateData: any = {}
      if (name && name !== user?.name) {
        updateData.name = name
      }
      if (password) {
        updateData.password = password
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await authApi.updateProfile(updateData.name, updateData.password)

        // Update localStorage with complete user data including category
        setUser(response.data)

        setSuccess('Profile updated successfully')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setIsEditing(false)
          setSuccess('')
          // Reload page to refresh user data in AuthContext
          window.location.reload()
        }, 2000)
      } else {
        setError('No changes to update')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Event handlers for created events
  const handleEditEvent = (event: Event) => {
    navigate(`/events/edit/${event.id}`)
  }

  const handleDeleteEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return
    }

    try {
      await eventApi.deleteEvent(event.id)
      setCreatedEvents(createdEvents.filter(e => e.id !== event.id))
    } catch (err) {
      setEventsError('Failed to delete event. Please try again.')
      console.error('Error deleting event:', err)
    }
  }

  const handlePublishEvent = async (event: Event) => {
    try {
      await eventApi.publishEvent(event.id)
      setCreatedEvents(createdEvents.map(e => 
        e.id === event.id ? { ...e, status: 'published' as const } : e
      ))
    } catch (err) {
      setEventsError('Failed to publish event. Please try again.')
      console.error('Error publishing event:', err)
    }
  }

  const handleCancelEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to cancel "${event.title}"?`)) {
      return
    }

    try {
      await eventApi.cancelEvent(event.id)
      setCreatedEvents(createdEvents.map(e => 
        e.id === event.id ? { ...e, status: 'cancelled' as const } : e
      ))
    } catch (err) {
      setEventsError('Failed to cancel event. Please try again.')
      console.error('Error cancelling event:', err)
    }
  }

  const handleSubmitForApproval = async (event: Event) => {
    try {
      await eventApi.submitForApproval(event.id)
      setCreatedEvents(createdEvents.map(e => 
        e.id === event.id ? { ...e, status: 'pending_approval' as const } : e
      ))
    } catch (err) {
      setEventsError('Failed to submit for approval. Please try again.')
      console.error('Error submitting for approval:', err)
    }
  }

  // Event handler for joined events
  const handleLeaveEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to leave "${event.title}"?`)) {
      return
    }

    try {
      await eventApi.leaveEvent(event.id)
      
      // Remove the event from the list
      setJoinedEvents(joinedEvents.filter(e => e.id !== event.id))
      setJoinedRegistrations(joinedRegistrations.filter(reg => reg.eventId !== event.id))
    } catch (err) {
      setEventsError('Failed to leave event. Please try again.')
      console.error('Error leaving event:', err)
    }
  }

  if (isEditing) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Email (cannot be changed)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ width: '100%', padding: '12px', backgroundColor: '#f8f9fa', color: '#6c757d', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Role (cannot be changed)
            </label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              style={{ width: '100%', padding: '12px', backgroundColor: '#f8f9fa', color: '#6c757d', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
              New Password (leave empty to keep current)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {success && (
            <div className="success">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Profile Header */}
      <div style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '24px 0'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{ 
              margin: '0', 
              color: '#2c3e50',
              fontSize: '32px',
              fontWeight: '700'
            }}>
              Profile
            </h1>
            <button 
              onClick={handleEdit}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          </div>
          
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              {/* Avatar */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              
              {/* User Info */}
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  color: '#2c3e50'
                }}>
                  {user.name}
                </h2>
                <p style={{
                  margin: '0 0 8px 0',
                  color: '#6c757d',
                  fontSize: '16px'
                }}>
                  {user.email}
                </p>

                {/* Category Badge */}
                {user.category && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: getCategoryBadgeColor(user.category),
                      color: user.category === 'staff' ? '#212529' : 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {user.category.charAt(0).toUpperCase() + user.category.slice(1)}
                    </span>
                  </div>
                )}

                <span style={{
                  backgroundColor: user.role === 'superadmin' ? '#007bff' :
                                 user.role === 'admin' ? '#28a745' :
                                 user.role === 'approver' ? '#ffc107' : '#6c757d',
                  color: user.role === 'approver' ? '#212529' : 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {user.role}
                </span>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={logout}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '8px',
          border: '1px solid #e9ecef'
        }}>
          <button
            onClick={() => setActiveTab('created')}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'created' ? '#007bff' : 'transparent',
              color: activeTab === 'created' ? 'white' : '#6c757d',
              transition: 'all 0.2s'
            }}
          >
            📋 Created Events
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'joined' ? '#007bff' : 'transparent',
              color: activeTab === 'joined' ? 'white' : '#6c757d',
              transition: 'all 0.2s'
            }}
          >
            🎫 Joined Events
          </button>
        </div>

        {/* Events Error */}
        {eventsError && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #f5c6cb'
          }}>
            {eventsError}
            <button
              onClick={() => setEventsError('')}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#721c24'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'created' && (
          <>
            {createdEvents.length === 0 && !eventsLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                color: '#6c757d',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '24px',
                  color: '#495057'
                }}>
                  No Created Events Yet
                </h3>
                <p style={{
                  margin: '0 0 24px 0',
                  fontSize: '16px'
                }}>
                  You haven't created any events yet. Start by creating your first event!
                </p>
                <button
                  onClick={() => navigate('/events/create')}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Create Event
                </button>
              </div>
            ) : (
              <EventsTable
                events={createdEvents}
                loading={eventsLoading}
                error={eventsError}
                showStatusFilters={true}
                statusFilterOptions={['all', 'draft', 'pending_approval', 'revision_requested', 'published', 'cancelled']}
                showDateFilters={true}
                showSearch={true}
                actions={[
                  {
                    type: 'edit',
                    label: 'Edit',
                    color: '#007bff',
                    condition: (event) => event.status === 'draft' || event.status === 'revision_requested',
                    handler: handleEditEvent
                  },
                  {
                    type: 'submit',
                    label: 'Submit for Approval',
                    color: '#28a745',
                    condition: (event) =>
                      (event.status === 'draft' || event.status === 'revision_requested') &&
                      (user?.role === 'user' || false),
                    handler: handleSubmitForApproval
                  },
                  {
                    type: 'publish',
                    label: 'Publish',
                    color: '#28a745',
                    condition: (event) =>
                      event.status === 'draft' &&
                      !!user?.role &&
                      ['approver', 'admin', 'superadmin'].includes(user.role),
                    handler: handlePublishEvent
                  },
                  {
                    type: 'cancel',
                    label: 'Cancel',
                    color: '#ffc107',
                    condition: (event) => event.status === 'published',
                    handler: handleCancelEvent
                  },
                  {
                    type: 'delete',
                    label: 'Delete',
                    color: '#dc3545',
                    condition: (event) => event.status === 'draft' || event.status === 'revision_requested',
                    handler: handleDeleteEvent
                  }
                ]}
                emptyMessage="No Created Events Yet"
                emptyDescription="You haven't created any events yet. Start by creating your first event!"
              />
            )}
          </>
        )}

        {activeTab === 'joined' && (
          <>
            {joinedEvents.length === 0 && !eventsLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                color: '#6c757d',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '24px',
                  color: '#495057'
                }}>
                  No Joined Events Yet
                </h3>
                <p style={{
                  margin: '0 0 24px 0',
                  fontSize: '16px'
                }}>
                  You haven't joined any events yet. Explore events and join ones that interest you!
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <EventsTable
                events={joinedEvents}
                loading={eventsLoading}
                error={eventsError}
                showStatusFilters={false}
                showDateFilters={true}
                showSearch={true}
                actions={[
                  {
                    type: 'leave',
                    label: 'Leave Event',
                    color: '#dc3545',
                    handler: handleLeaveEvent
                  }
                ]}
                emptyMessage="No Joined Events Yet"
                emptyDescription="You haven't joined any events yet. Explore events and join ones that interest you!"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Profile