import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi } from '../auth/api'
import type { Event, UpdateEventDto } from '../auth/api'
import { LocationDropdown } from '../components/LocationDropdown'

const EditEventPage = () => {
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<UpdateEventDto>({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '',
    registrationEndTime: '',
    locationId: 0,
    maxAttendees: undefined,
    status: 'draft'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid event ID')
      setLoading(false)
      return
    }

    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await eventApi.getEventById(Number(id))
      const eventData = response.data
      
      setEvent(eventData)
      setFormData({
        title: eventData.title,
        description: eventData.description,
        eventDate: eventData.eventDate,
        eventTime: eventData.eventTime,
        registrationStartDate: eventData.registrationStartDate,
        registrationStartTime: eventData.registrationStartTime,
        registrationEndDate: eventData.registrationEndDate,
        registrationEndTime: eventData.registrationEndTime,
        locationId: eventData.locationId,
        maxAttendees: eventData.maxAttendees,
        status: eventData.status
      })
    } catch (err) {
      setError('Failed to load event. You may not have permission to edit this event.')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.title?.trim()) {
      return 'Event title is required'
    }
    if (!formData.locationId || formData.locationId === 0) {
      return 'Location is required'
    }
    if (!formData.eventDate) {
      return 'Event date is required'
    }
    if (!formData.eventTime) {
      return 'Event time is required'
    }
    if (!formData.registrationStartDate) {
      return 'Registration start date is required'
    }
    if (!formData.registrationStartTime) {
      return 'Registration start time is required'
    }
    if (!formData.registrationEndDate) {
      return 'Registration end date is required'
    }
    if (!formData.registrationEndTime) {
      return 'Registration end time is required'
    }

    // Validate registration period
    const regStartDateTime = new Date(`${formData.registrationStartDate}T${formData.registrationStartTime}`)
    const regEndDateTime = new Date(`${formData.registrationEndDate}T${formData.registrationEndTime}`)
    const eventStartDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`)

    if (regStartDateTime >= regEndDateTime) {
      return 'Registration end must be after registration start'
    }

    if (regEndDateTime > eventStartDateTime) {
      return 'Registration must close before or at event start time'
    }

    // Check if event is in the future (for published events)
    if (formData.status === 'published') {
      const now = new Date()
      if (eventStartDateTime <= now) {
        return 'Published events cannot be scheduled in the past'
      }
      if (regEndDateTime <= now) {
        return 'Cannot publish events where registration has already ended'
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
      setSaving(true)
      setError('')
      
      await eventApi.updateEvent(Number(id), formData)
      navigate('/profile?tab=created')
    } catch (err) {
      setError('Failed to update event. Please try again.')
      console.error('Error updating event:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' ? (value ? parseInt(value) : undefined) : value
    }))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading event...</div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Error</h3>
          <p style={{ margin: '0 0 20px 0' }}>{error}</p>
          <button
            onClick={() => navigate('/events/my')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to My Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Edit Event</h1>
        <p style={{ margin: '0', color: '#6c757d' }}>
          Make changes to your event details
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
            value={formData.title || ''}
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
            value={formData.description || ''}
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

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '500' }}>
            Event Date & Time *
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '400', fontSize: '14px' }}>
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate || ''}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '400', fontSize: '14px' }}>
                Event Time
              </label>
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime || ''}
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
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '500' }}>
            Registration Period *
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6c757d' }}>
            Users can only join this event during the registration period
          </p>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
              Registration Opens
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="date"
                  name="registrationStartDate"
                  value={formData.registrationStartDate || ''}
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
                <input
                  type="time"
                  name="registrationStartTime"
                  value={formData.registrationStartTime || ''}
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
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
              Registration Closes
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="date"
                  name="registrationEndDate"
                  value={formData.registrationEndDate || ''}
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
                <input
                  type="time"
                  name="registrationEndTime"
                  value={formData.registrationEndTime || ''}
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
          </div>
        </div>

        <LocationDropdown
          value={formData.locationId || 0}
          onChange={(locationId) => {
            setFormData(prev => ({
              ...prev,
              locationId
            }))
          }}
          label="Location"
          required={true}
        />

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
            value={formData.status || 'draft'}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? '#6c757d' : '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              flex: 1
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
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

export default EditEventPage