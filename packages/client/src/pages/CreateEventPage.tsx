import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { CreateEventDto } from '../auth/api'

const CreateEventPage = () => {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    maxAttendees: undefined,
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Event title is required'
    }
    if (!formData.location.trim()) {
      return 'Location is required'
    }
    if (!formData.eventDate) {
      return 'Event date is required'
    }
    if (!formData.eventTime) {
      return 'Event time is required'
    }

    // Check if date is in the future (for published events)
    if (formData.status === 'published') {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`)
      const now = new Date()
      if (eventDateTime <= now) {
        return 'Published events cannot be scheduled in the past'
      }
    }

    if (formData.maxAttendees !== undefined && formData.maxAttendees < 1) {
      return 'Maximum attendees must be at least 1'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const eventData = {
        ...formData,
        maxAttendees: formData.maxAttendees || undefined
      }
      
      await eventApi.createEvent(eventData)
      navigate('/events/my')
    } catch (err) {
      setError('Failed to create event. Please try again.')
      console.error('Error creating event:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' ? (value ? parseInt(value) : undefined) : value
    }))
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Create New Event</h1>
        <p style={{ margin: '0', color: '#6c757d' }}>
          Fill in the details for your new campus event
        </p>
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
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter event title"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical'
            }}
            placeholder="Describe your event..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Date *
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Time *
            </label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter event location"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Maximum Attendees
          </label>
          <input
            type="number"
            name="maxAttendees"
            value={formData.maxAttendees || ''}
            onChange={handleChange}
            min="1"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="draft">Draft (save for later)</option>
            <option value="published">Published (visible to everyone)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              flex: 1
            }}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/events/my')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateEventPage