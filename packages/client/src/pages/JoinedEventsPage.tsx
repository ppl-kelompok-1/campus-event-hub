import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventsTable from '../components/EventsTable'
import type { EventsTableAction } from '../components/EventsTable'

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

const JoinedEventsPage = () => {
  const [registrations, setRegistrations] = useState<JoinedEventRegistration[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchJoinedEvents()
  }, [isAuthenticated, navigate])

  const fetchJoinedEvents = async () => {
    try {
      setLoading(true)
      setError('')

      // Get user's registrations
      const registrationsResponse = await eventApi.getJoinedEvents()
      setRegistrations(registrationsResponse.data)

      // Get full event details for each registration
      const eventPromises = registrationsResponse.data.map(reg =>
        eventApi.getEventById(reg.eventId)
      )

      const eventResponses = await Promise.all(eventPromises)
      const eventsData = eventResponses
        .filter(response => response.data) // Filter out any null events
        .map(response => {
          const event = response.data!

          // Find the corresponding registration for this event
          const registration = registrationsResponse.data.find(reg => reg.eventId === event.id)

          // Merge registration status with event data
          if (registration) {
            return {
              ...event,
              isUserRegistered: true,
              userRegistrationStatus: registration.status,
              // These properties help the button logic work correctly
              canRegister: false // User is already registered
            }
          }

          return event
        })

      setEvents(eventsData)
    } catch (err) {
      setError('Failed to load your joined events. Please try again later.')
      console.error('Error fetching joined events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to leave "${event.title}"?`)) {
      return
    }

    try {
      await eventApi.leaveEvent(event.id)

      // Remove the event from the list
      setEvents(events.filter(e => e.id !== event.id))
      setRegistrations(registrations.filter(reg => reg.eventId !== event.id))
    } catch (err) {
      setError('Failed to leave event. Please try again.')
      console.error('Error leaving event:', err)
    }
  }

  // Define table actions
  const tableActions: EventsTableAction[] = [
    {
      type: 'leave',
      label: 'Leave Event',
      color: '#dc3545',
      handler: handleLeaveEvent
    }
  ]

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
            My Joined Events
          </h1>
          <p style={{
            margin: '0',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Events you have registered for or are on the waitlist
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <EventsTable
          events={events}
          loading={loading}
          error={error}
          showStatusFilters={false}
          showDateFilters={true}
          showSearch={true}
          actions={tableActions}
          emptyMessage="No Joined Events Yet"
          emptyDescription="You haven't joined any events yet. Explore events and join ones that interest you!"
        />
      </div>
    </div>
  )
}

export default JoinedEventsPage
