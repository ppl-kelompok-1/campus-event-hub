import { useState, useEffect } from 'react'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventTimelineItem from '../components/EventTimelineItem'
import { useAuth } from '../auth/AuthContext'

const Home = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming')
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [currentPage, activeFilter])

  const filterAndSortEventsByDate = (events: Event[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Filter events based on active filter
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      
      if (activeFilter === 'upcoming') {
        return eventDateOnly >= today
      } else {
        return eventDateOnly < today
      }
    })
    
    // Sort events by date - nearest date first
    return filteredEvents.sort((a, b) => {
      const dateA = new Date(a.eventDate)
      const dateB = new Date(b.eventDate)
      
      if (activeFilter === 'upcoming') {
        // For upcoming events: sort ascending (nearest future date first)
        return dateA.getTime() - dateB.getTime()
      } else {
        // For past events: sort descending (most recent past date first)
        return dateB.getTime() - dateA.getTime()
      }
    })
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')
      // Fetch more events to ensure we have enough after filtering
      // Include auth if user is authenticated to get registration status
      const response = await eventApi.getEvents(1, 50, isAuthenticated)
      const filteredEvents = filterAndSortEventsByDate(response.data)
      
      // Simple client-side pagination
      const startIndex = (currentPage - 1) * 10
      const endIndex = startIndex + 10
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex)
      
      setEvents(paginatedEvents)
      setTotalPages(Math.ceil(filteredEvents.length / 10))
    } catch (err) {
      setError('Failed to load events. Please try again later.')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
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

  const handleFilterChange = (filter: 'upcoming' | 'past') => {
    setActiveFilter(filter)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading events...</div>
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
            
            {/* Filter buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px' 
            }}>
              <button 
                onClick={() => handleFilterChange('upcoming')}
                style={{
                  backgroundColor: activeFilter === 'upcoming' ? '#007bff' : 'transparent',
                  color: activeFilter === 'upcoming' ? 'white' : '#6c757d',
                  border: activeFilter === 'upcoming' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Upcoming
              </button>
              <button 
                onClick={() => handleFilterChange('past')}
                style={{
                  backgroundColor: activeFilter === 'past' ? '#007bff' : 'transparent',
                  color: activeFilter === 'past' ? 'white' : '#6c757d',
                  border: activeFilter === 'past' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Past
              </button>
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
              No Events Found
            </h3>
            <p style={{ 
              margin: '0',
              fontSize: '16px'
            }}>
              There are no published events at the moment. Check back later!
            </p>
          </div>
        ) : (
          <>
            {/* Events Timeline */}
            <div style={{ marginBottom: '40px' }}>
              {events.map((event) => (
                <EventTimelineItem 
                  key={event.id} 
                  event={event}
                  showJoinButton={isAuthenticated}
                  userRole={user?.role}
                  onJoin={handleJoinEvent}
                  onLeave={handleLeaveEvent}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: currentPage === 1 ? '#e9ecef' : '#007bff',
                    color: currentPage === 1 ? '#6c757d' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Previous
                </button>
                
                <span style={{ 
                  color: '#495057',
                  fontWeight: '500'
                }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: currentPage === totalPages ? '#e9ecef' : '#007bff',
                    color: currentPage === totalPages ? '#6c757d' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home