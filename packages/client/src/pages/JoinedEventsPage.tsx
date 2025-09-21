import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventTimelineItem from '../components/EventTimelineItem'

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
        .map(response => response.data!)
        
      // Sort events by nearest date first
      const sortedEvents = eventsData.sort((a, b) => {
        const dateA = new Date(a.eventDate)
        const dateB = new Date(b.eventDate)
        const now = new Date()
        
        // Calculate absolute difference from current date
        const diffA = Math.abs(dateA.getTime() - now.getTime())
        const diffB = Math.abs(dateB.getTime() - now.getTime())
        
        return diffA - diffB // Nearest date first
      })
      
      setEvents(sortedEvents)
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading your joined events...</div>
      </div>
    )
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
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
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
            <button
              onClick={() => setError('')}
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

        {events.length === 0 ? (
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
              onClick={() => navigate('/events')}
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
          <>
            {/* Events Timeline */}
            <div style={{ marginBottom: '40px' }}>
              {events.map((event) => {
                // Find the registration info for this event
                const registration = registrations.find(reg => reg.eventId === event.id)
                
                return (
                  <div key={event.id} style={{ position: 'relative' }}>
                    {/* Registration Status Badge */}
                    {registration && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '20px',
                        zIndex: 10,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: registration.status === 'registered' 
                          ? '#d4edda' 
                          : registration.status === 'waitlisted'
                          ? '#fff3cd'
                          : '#f8d7da',
                        color: registration.status === 'registered' 
                          ? '#155724' 
                          : registration.status === 'waitlisted'
                          ? '#856404'
                          : '#721c24'
                      }}>
                        {registration.status === 'registered' && '✓ Registered'}
                        {registration.status === 'waitlisted' && '⏳ Waitlisted'}
                        {registration.status === 'cancelled' && '❌ Cancelled'}
                      </div>
                    )}
                    
                    <EventTimelineItem 
                      event={event}
                      showJoinButton={false}
                      showManagementActions={false}
                      onLeave={handleLeaveEvent}
                    />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default JoinedEventsPage