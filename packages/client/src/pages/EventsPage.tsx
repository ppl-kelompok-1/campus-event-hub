import { useState, useEffect } from 'react'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventTimelineItem from '../components/EventTimelineItem'

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEvents()
  }, [currentPage])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await eventApi.getEvents(currentPage, 10)
      setEvents(response.data)
      setTotalPages(response.pagination.totalPages)
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

  const handleJoinEvent = (event: Event) => {
    // TODO: Implement join event functionality
    console.log('Join event:', event.title)
    // This will be implemented when the join feature is added
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
                Events
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
              <button style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Upcoming
              </button>
              <button style={{
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
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
                  onJoin={handleJoinEvent}
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

export default EventsPage