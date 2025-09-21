import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventTimelineItem from '../components/EventTimelineItem'

const MyEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchMyEvents()
  }, [isAuthenticated, navigate])

  const fetchMyEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await eventApi.getMyEvents()
      
      // Sort events by date - nearest date first
      const sortedEvents = response.data.sort((a, b) => {
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
      setError('Failed to load your created events. Please try again later.')
      console.error('Error fetching my events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    navigate(`/events/edit/${event.id}`)
  }

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await eventApi.deleteEvent(event.id)
      setEvents(events.filter(e => e.id !== event.id))
    } catch (err) {
      setError('Failed to delete event. Please try again.')
      console.error('Error deleting event:', err)
    }
  }

  const handlePublish = async (event: Event) => {
    try {
      await eventApi.publishEvent(event.id)
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, status: 'published' as const } : e
      ))
    } catch (err) {
      setError('Failed to publish event. Please try again.')
      console.error('Error publishing event:', err)
    }
  }

  const handleSubmitForApproval = async (event: Event) => {
    try {
      await eventApi.submitForApproval(event.id)
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, status: 'pending_approval' as const } : e
      ))
    } catch (err) {
      setError('Failed to submit event for approval. Please try again.')
      console.error('Error submitting event for approval:', err)
    }
  }

  const handleCancel = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to cancel "${event.title}"?`)) {
      return
    }

    try {
      await eventApi.cancelEvent(event.id)
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, status: 'cancelled' as const } : e
      ))
    } catch (err) {
      setError('Failed to cancel event. Please try again.')
      console.error('Error cancelling event:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading your created events...</div>
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
                My Created Events
              </h1>
              <p style={{ 
                margin: '0', 
                color: '#6c757d',
                fontSize: '16px'
              }}>
                Manage events you've created and track their status
              </p>
            </div>
            
            {/* Create Event Button */}
            <Link
              to="/events/create"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                display: 'inline-block',
                fontSize: '14px'
              }}
            >
              + Create Event
            </Link>
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
              No Created Events Yet
            </h3>
            <p style={{ 
              margin: '0 0 24px 0',
              fontSize: '16px'
            }}>
              You haven't created any events yet. Start by creating your first event!
            </p>
            <Link
              to="/events/create"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-block',
                fontWeight: '500'
              }}
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          <>
            {/* Events Timeline */}
            <div style={{ marginBottom: '40px' }}>
              {events.map((event) => (
                <EventTimelineItem
                  key={event.id}
                  event={event}
                  showJoinButton={false}
                  showManagementActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPublish={user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'approver' ? handlePublish : undefined}
                  onSubmitForApproval={user?.role === 'user' ? handleSubmitForApproval : undefined}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyEventsPage