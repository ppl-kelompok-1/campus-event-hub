import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventCard from '../components/EventCard'

const MyEventsPage = () => {
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
    fetchMyEvents()
  }, [isAuthenticated, navigate])

  const fetchMyEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await eventApi.getMyEvents()
      setEvents(response.data)
    } catch (err) {
      setError('Failed to load your events. Please try again later.')
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
        <div>Loading your events...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px' 
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>My Events</h1>
          <p style={{ margin: '0', color: '#6c757d' }}>
            Manage your events and track their status
          </p>
        </div>
        
        <Link
          to="/events/create"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            display: 'inline-block'
          }}
        >
          + Create Event
        </Link>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
          <button
            onClick={() => setError('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              fontSize: '16px',
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
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>No Events Yet</h3>
          <p style={{ margin: '0 0 20px 0' }}>
            You haven't created any events yet. Start by creating your first event!
          </p>
          <Link
            to="/events/create"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEventsPage