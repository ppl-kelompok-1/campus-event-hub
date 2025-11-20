import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { Event } from '../auth/api'
import EventsTable from '../components/EventsTable'
import type { EventsTableAction } from '../components/EventsTable'

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
      setEvents(response.data)
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

  // Define table actions based on user role and event status
  const tableActions: EventsTableAction[] = [
    {
      type: 'edit',
      label: 'Edit',
      color: '#007bff',
      condition: (event) => event.status === 'draft' || event.status === 'revision_requested',
      handler: handleEdit
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
      handler: handlePublish
    },
    {
      type: 'cancel',
      label: 'Cancel',
      color: '#ffc107',
      condition: (event) => event.status === 'published',
      handler: handleCancel
    },
    {
      type: 'delete',
      label: 'Delete',
      color: '#dc3545',
      condition: (event) => event.status === 'draft' || event.status === 'revision_requested',
      handler: handleDelete
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <EventsTable
          events={events}
          loading={loading}
          error={error}
          showStatusFilters={true}
          statusFilterOptions={['all', 'draft', 'pending_approval', 'revision_requested', 'published', 'cancelled']}
          showDateFilters={true}
          showSearch={true}
          actions={tableActions}
          emptyMessage="No Created Events Yet"
          emptyDescription="You haven't created any events yet. Start by creating your first event!"
        />
      </div>
    </div>
  )
}

export default MyEventsPage
