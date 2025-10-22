import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { eventApi } from '../auth/api'
import type { Event, EventAttachment } from '../auth/api'
import { FileUpload } from '../components/FileUpload'
import { AttachmentList } from '../components/AttachmentList'
import { useAuth } from '../auth/AuthContext'

interface Attendee {
  id: number
  userId: number
  userName: string
  registrationDate: string
}

const EventDetailsPage = () => {
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attachments, setAttachments] = useState<EventAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [error, setError] = useState('')
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

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
      setEvent(response.data)

      // Also fetch attendees and attachments
      fetchAttendees()
      fetchAttachments()
    } catch (err) {
      setError('Failed to load event details.')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendees = async () => {
    try {
      setAttendeesLoading(true)
      const response = await eventApi.getEventAttendees(Number(id))
      setAttendees(response.data)
    } catch (err) {
      // Don't set error for attendees - just log it
      console.error('Error fetching attendees:', err)
    } finally {
      setAttendeesLoading(false)
    }
  }

  const fetchAttachments = async () => {
    try {
      setAttachmentsLoading(true)
      const response = await eventApi.getEventAttachments(Number(id))
      setAttachments(response.data)
    } catch (err) {
      // Don't set error for attachments - just log it
      console.error('Error fetching attachments:', err)
    } finally {
      setAttachmentsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, React.CSSProperties> = {
      draft: { backgroundColor: '#6c757d', color: 'white' },
      published: { backgroundColor: '#28a745', color: 'white' },
      cancelled: { backgroundColor: '#dc3545', color: 'white' },
      completed: { backgroundColor: '#007bff', color: 'white' }
    }

    return (
      <span
        style={{
          ...(statusStyles[status] || statusStyles.draft),
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '0.875rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}
      >
        {status}
      </span>
    )
  }

  const isEventInPast = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`)
    return eventDateTime < new Date()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading event details...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Event Not Found</h3>
          <p style={{ margin: '0 0 20px 0' }}>
            {error || 'The event you are looking for does not exist or has been removed.'}
          </p>
          <Link
            to="/events"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/events"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Events
        </Link>
      </div>

      {/* Event header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h1 style={{ 
            margin: '0',
            color: '#2c3e50',
            fontSize: '2rem',
            lineHeight: '1.2'
          }}>
            {event.title}
          </h1>
          {getStatusBadge(event.status)}
        </div>

        {/* Event meta information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px'
        }}>
          <div>
            <div style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '4px' }}>
              📅 Date & Time
            </div>
            <div style={{ fontWeight: '500' }}>
              {formatDate(event.eventDate)}
            </div>
            <div style={{ color: '#6c757d' }}>
              {formatTime(event.eventTime)}
            </div>
            {isEventInPast(event.eventDate, event.eventTime) && (
              <div style={{
                color: '#dc3545',
                fontSize: '0.875rem',
                fontStyle: 'italic',
                marginTop: '4px'
              }}>
                This event has passed
              </div>
            )}
          </div>

          <div>
            <div style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '4px' }}>
              📍 Location
            </div>
            <div style={{ fontWeight: '500' }}>
              {event.locationName}
            </div>
          </div>

          <div>
            <div style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '4px' }}>
              👤 Organizer
            </div>
            <div style={{ fontWeight: '500' }}>
              <Link 
                to={`/users/${event.createdBy}/profile`}
                style={{
                  color: '#007bff',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                {event.creatorName}
              </Link>
            </div>
          </div>

          {event.maxAttendees && (
            <div>
              <div style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '4px' }}>
                👥 Max Attendees
              </div>
              <div style={{ fontWeight: '500' }}>
                {event.maxAttendees}
              </div>
            </div>
          )}
        </div>

        {/* Event description */}
        {event.description && (
          <div>
            <h3 style={{ 
              margin: '0 0 16px 0',
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              About This Event
            </h3>
            <div style={{
              lineHeight: '1.6',
              color: '#495057',
              whiteSpace: 'pre-wrap'
            }}>
              {event.description}
            </div>
          </div>
        )}

        {/* Attendees Section */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ 
            margin: '0 0 16px 0',
            color: '#2c3e50',
            fontSize: '1.25rem'
          }}>
            Who's Attending
          </h3>
          
          {attendeesLoading ? (
            <div style={{ 
              padding: '20px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              Loading attendees...
            </div>
          ) : attendees.length === 0 ? (
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#6c757d',
              border: '1px solid #e9ecef'
            }}>
              No one has registered for this event yet.
            </div>
          ) : (
            <>
              <div style={{
                color: '#6c757d',
                fontSize: '0.9rem',
                marginBottom: '16px'
              }}>
                {attendees.length} {attendees.length === 1 ? 'person is' : 'people are'} attending
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      flexShrink: 0
                    }}>
                      {attendee.userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/users/${attendee.userId}/profile`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <div style={{
                          fontWeight: '500',
                          color: '#007bff',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none'
                        }}
                        >
                          {attendee.userName}
                        </div>
                      </Link>
                      <div style={{
                        fontSize: '12px',
                        color: '#6c757d'
                      }}>
                        Joined {new Date(attendee.registrationDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Attachments Section */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            color: '#2c3e50',
            fontSize: '1.25rem'
          }}>
            Event Attachments
          </h3>

          {user && user.id === event.createdBy && (
            <FileUpload
              eventId={event.id}
              onUploadSuccess={(attachment) => {
                setAttachments(prev => [attachment, ...prev])
              }}
            />
          )}

          {attachmentsLoading ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              Loading attachments...
            </div>
          ) : (
            <AttachmentList
              attachments={attachments}
              eventCreatorId={event.createdBy}
              onDeleteSuccess={(attachmentId) => {
                setAttachments(prev => prev.filter(a => a.id !== attachmentId))
              }}
            />
          )}
        </div>

        {/* Event status notice */}
        {event.status === 'cancelled' && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '16px',
            borderRadius: '6px',
            marginTop: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Event Cancelled</strong><br />
            This event has been cancelled by the organizer.
          </div>
        )}

        {event.status === 'draft' && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '16px',
            borderRadius: '6px',
            marginTop: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>Draft Event</strong><br />
            This event is still in draft mode and may not be final.
          </div>
        )}
      </div>

      {/* Event metadata */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '0.875rem',
        color: '#6c757d'
      }}>
        <div style={{ marginBottom: '8px' }}>
          Created: {new Date(event.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </div>
        {event.updatedAt !== event.createdAt && (
          <div>
            Last updated: {new Date(event.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetailsPage