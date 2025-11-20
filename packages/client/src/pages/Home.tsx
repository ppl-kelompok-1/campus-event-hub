import { useState, useEffect } from 'react'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventsTable from '../components/EventsTable'
import type { EventsTableAction } from '../components/EventsTable'
import { useAuth } from '../auth/AuthContext'

const Home = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [isAuthenticated])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')
      // Fetch all published events
      // Include auth if user is authenticated to get registration status
      const response = await eventApi.getEvents(1, 100, isAuthenticated)
      setEvents(response.data)
    } catch (err) {
      setError('Failed to load events. Please try again later.')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async (event: Event) => {
    try {
      const response = await eventApi.joinEvent(event.id)

      // Update the event in the local state with new registration info
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === event.id
            ? {
                ...e,
                isUserRegistered: true,
                userRegistrationStatus: response.data.status as 'registered' | 'waitlisted' | 'cancelled',
                currentAttendees: response.data.status === 'registered'
                  ? (e.currentAttendees || 0) + 1
                  : e.currentAttendees,
                isFull: e.maxAttendees ? ((e.currentAttendees || 0) + (response.data.status === 'registered' ? 1 : 0)) >= e.maxAttendees : false
              }
            : e
        )
      )

      // Show success message
      if (response.data.status === 'registered') {
        console.log('Successfully joined event:', event.title)
      } else if (response.data.status === 'waitlisted') {
        console.log('Added to waitlist for event:', event.title)
      }
    } catch (err) {
      console.error('Failed to join event:', err)
      setError('Failed to join event. Please try again.')
    }
  }

  const handleLeaveEvent = async (event: Event) => {
    try {
      await eventApi.leaveEvent(event.id)

      // Update the event in the local state
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === event.id
            ? {
                ...e,
                isUserRegistered: false,
                userRegistrationStatus: undefined,
                currentAttendees: e.userRegistrationStatus === 'registered'
                  ? Math.max((e.currentAttendees || 1) - 1, 0)
                  : e.currentAttendees,
                isFull: false // If user left, it's no longer full
              }
            : e
        )
      )

      console.log('Successfully left event:', event.title)
    } catch (err) {
      console.error('Failed to leave event:', err)
      setError('Failed to leave event. Please try again.')
    }
  }

  // Define table actions
  const tableActions: EventsTableAction[] = []

  if (isAuthenticated) {
    tableActions.push({
      type: 'register',
      label: 'Register',
      color: '#007bff',
      hoverColor: '#0056b3',
      condition: (event) =>
        !event.isUserRegistered &&
        !!event.canRegister &&
        !!event.hasRegistrationStarted &&
        !event.isFull,
      handler: handleJoinEvent
    })

    tableActions.push({
      type: 'leave',
      label: 'Leave',
      color: '#dc3545',
      condition: (event) => event.isUserRegistered === true,
      handler: handleLeaveEvent
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '24px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            margin: '0 0 8px 0',
            color: '#2c3e50',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            Campus Events
          </h1>
          <p style={{
            margin: '0',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Discover and join exciting events happening on campus
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <EventsTable
          events={events}
          loading={loading}
          error={error}
          showStatusFilters={true}
          statusFilterOptions={['all', 'published', 'cancelled']}
          showDateFilters={true}
          showSearch={true}
          actions={tableActions}
          emptyMessage="No Events Found"
          emptyDescription="There are no published events at the moment. Check back later!"
        />
      </div>
    </div>
  )
}

export default Home
