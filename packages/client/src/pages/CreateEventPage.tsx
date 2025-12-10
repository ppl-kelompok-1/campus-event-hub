import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi, locationApi } from '../auth/api'
import type { CreateEventDto, Location, UserCategory } from '../auth/api'
import { LocationDropdown } from '../components/LocationDropdown'
import CategoryMultiSelect from '../components/CategoryMultiSelect'

const CreateEventPage = () => {
  const [formData, setFormData] = useState<CreateEventDto>({
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
  const [allowedCategories, setAllowedCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileSizeError, setFileSizeError] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  // Fetch location details when locationId changes
  useEffect(() => {
    const fetchLocation = async () => {
      if (formData.locationId && formData.locationId > 0) {
        try {
          const response = await locationApi.getById(formData.locationId)
          setSelectedLocation(response.data)
        } catch (err) {
          console.error('Error fetching location:', err)
          setSelectedLocation(null)
        }
      } else {
        setSelectedLocation(null)
      }
    }
    fetchLocation()
  }, [formData.locationId])

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
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

    // Validate maxAttendees doesn't exceed location capacity
    if (formData.maxAttendees !== undefined && selectedLocation && selectedLocation.maxCapacity !== undefined) {
      if (formData.maxAttendees > selectedLocation.maxCapacity) {
        return `Maximum attendees (${formData.maxAttendees}) cannot exceed location capacity (${selectedLocation.maxCapacity})`
      }
    }

    // Validate attachments are required
    if (files.length === 0) {
      // If there was a file size error, show that instead
      if (fileSizeError) {
        return fileSizeError
      }
      return 'At least one attachment is required'
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
        maxAttendees: formData.maxAttendees || undefined,
        allowedCategories: allowedCategories.length > 0 ? allowedCategories : undefined
      }

      // Create the event first
      const response = await eventApi.createEvent(eventData)
      const eventId = response.data.id

      // Upload files if any
      if (files.length > 0) {
        await Promise.all(
          files.map(file => eventApi.uploadAttachment(eventId, file))
        )
      }

      // Navigate to the event details page
      navigate(`/events/${eventId}`)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Validate file sizes
    const invalidFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      const errorMsg = `File size exceeds 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}. Please select a smaller file.`
      setError(errorMsg)
      setFileSizeError(errorMsg)
      return
    }

    setFiles(prev => [...prev, ...selectedFiles])
    setFileSizeError('')
    setError('')
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const fillDummyData = () => {
    // Calculate valid dates for testing
    const now = new Date()

    // Registration started yesterday
    const regStart = new Date(now)
    regStart.setDate(regStart.getDate() - 1)
    regStart.setHours(9, 0, 0, 0)

    // Registration closes tomorrow
    const regEnd = new Date(now)
    regEnd.setDate(regEnd.getDate() + 1)
    regEnd.setHours(23, 59, 0, 0)

    // Event happens day after tomorrow
    const eventDate = new Date(now)
    eventDate.setDate(eventDate.getDate() + 2)
    eventDate.setHours(14, 0, 0, 0)

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }

    // Format times as HH:MM
    const formatTime = (date: Date) => {
      return date.toTimeString().slice(0, 5)
    }

    setFormData({
      title: 'Sample Campus Event - Tech Workshop',
      description: 'This is a test event for development purposes. Join us for an exciting workshop on modern web development technologies including React, TypeScript, and backend APIs. Learn best practices and hands-on coding experience.',
      eventDate: formatDate(eventDate),
      eventTime: formatTime(eventDate),
      registrationStartDate: formatDate(regStart),
      registrationStartTime: formatTime(regStart),
      registrationEndDate: formatDate(regEnd),
      registrationEndTime: formatTime(regEnd),
      locationId: 1, // Assuming location ID 1 exists
      maxAttendees: 50,
      status: 'draft'
    })

    // Set some allowed categories for testing
    setAllowedCategories(['mahasiswa', 'dosen'])

    setError('')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Create New Event</h1>
        <p style={{ margin: '0', color: '#6c757d' }}>
          Fill in the details for your new campus event
        </p>
        <button
          type="button"
          onClick={fillDummyData}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            fontSize: '12px',
            color: '#007bff',
            backgroundColor: 'transparent',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          🔧 Insert Dummy Data (Testing)
        </button>
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
                value={formData.eventDate}
                onChange={handleChange}
                required
                onKeyDown={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
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
                  value={formData.registrationStartDate}
                  onChange={handleChange}
                  required
                  onKeyDown={(e) => e.preventDefault()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div>
                <input
                  type="time"
                  name="registrationStartTime"
                  value={formData.registrationStartTime}
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
                  value={formData.registrationEndDate}
                  onChange={handleChange}
                  required
                  onKeyDown={(e) => e.preventDefault()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div>
                <input
                  type="time"
                  name="registrationEndTime"
                  value={formData.registrationEndTime}
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
          value={formData.locationId}
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
            max={selectedLocation?.maxCapacity}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Leave empty for unlimited"
          />
          {selectedLocation && selectedLocation.maxCapacity && (
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              Location capacity: {selectedLocation.maxCapacity} attendees
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <CategoryMultiSelect
            value={allowedCategories}
            onChange={setAllowedCategories}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Event Attachments *
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
            Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, WEBP, TXT (max 10MB each). <strong>At least one file is required.</strong>
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Selected files ({files.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: '500',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginLeft: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {/* Only admin, superadmin, and approver can publish directly */}
            {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'approver') && (
              <option value="published">Published (visible to everyone)</option>
            )}
          </select>
          {user?.role === 'user' && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#6c757d',
              fontStyle: 'italic' 
            }}>
              Note: Regular users must submit events for approval before they can be published.
            </div>
          )}
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