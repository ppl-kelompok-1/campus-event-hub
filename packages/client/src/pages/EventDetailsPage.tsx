import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { eventApi } from '../auth/api'
import type { Event, EventAttachment, EventApprovalHistory } from '../auth/api'
import { FileUpload } from '../components/FileUpload'
import { AttachmentList } from '../components/AttachmentList'
import EventApprovalHistoryComponent from '../components/EventApprovalHistory'
import { useAuth } from '../auth/AuthContext'
import { getToken } from '../auth/storage'

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
  const [approvalHistory, setApprovalHistory] = useState<EventApprovalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [approvalHistoryLoading, setApprovalHistoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionComments, setRevisionComments] = useState('')
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

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

      // Also fetch attendees, attachments, and approval history
      fetchAttendees()
      fetchAttachments()
      fetchApprovalHistory()
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

  const fetchApprovalHistory = async () => {
    try {
      setApprovalHistoryLoading(true)
      const response = await eventApi.getApprovalHistory(Number(id))
      setApprovalHistory(response.data)
    } catch (err) {
      // Don't set error for approval history - just log it
      // User might not have permission to view it
      console.error('Error fetching approval history:', err)
    } finally {
      setApprovalHistoryLoading(false)
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

  // Action Handlers
  const handleEdit = () => {
    navigate(`/events/edit/${event?.id}`)
  }

  const handleDelete = async () => {
    if (!event || !window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(true)
      await eventApi.deleteEvent(event.id)
      navigate('/profile')
    } catch (err) {
      setError('Failed to delete event. Please try again.')
      console.error('Error deleting event:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!event) return

    try {
      setActionLoading(true)
      await eventApi.publishEvent(event.id)
      setEvent({ ...event, status: 'published' as const })
      setError('')
    } catch (err) {
      setError('Failed to publish event. Please try again.')
      console.error('Error publishing event:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitForApproval = async () => {
    if (!event) return

    try {
      setActionLoading(true)
      await eventApi.submitForApproval(event.id)
      setEvent({ ...event, status: 'pending_approval' as const })
      setError('')
    } catch (err) {
      setError('Failed to submit event for approval. Please try again.')
      console.error('Error submitting event for approval:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!event || !window.confirm(`Are you sure you want to cancel "${event.title}"?`)) {
      return
    }

    try {
      setActionLoading(true)
      await eventApi.cancelEvent(event.id)
      setEvent({ ...event, status: 'cancelled' as const })
      setError('')
    } catch (err) {
      setError('Failed to cancel event. Please try again.')
      console.error('Error cancelling event:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinEvent = async () => {
    if (!event) return

    try {
      setActionLoading(true)
      const response = await eventApi.joinEvent(event.id)

      // Update event state with new registration info
      setEvent({
        ...event,
        isUserRegistered: true,
        userRegistrationStatus: response.data.status as 'registered' | 'waitlisted' | 'cancelled',
        currentAttendees: response.data.status === 'registered'
          ? (event.currentAttendees || 0) + 1
          : event.currentAttendees,
        isFull: event.maxAttendees ? ((event.currentAttendees || 0) + (response.data.status === 'registered' ? 1 : 0)) >= event.maxAttendees : false
      })

      // Refresh attendees list
      await fetchAttendees()
      setError('')
    } catch (err) {
      console.error('Failed to join event:', err)
      setError('Failed to join event. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveEvent = async () => {
    if (!event || !window.confirm(`Are you sure you want to leave "${event.title}"?`)) {
      return
    }

    try {
      setActionLoading(true)
      await eventApi.leaveEvent(event.id)

      // Update event state
      setEvent({
        ...event,
        isUserRegistered: false,
        userRegistrationStatus: undefined,
        currentAttendees: event.userRegistrationStatus === 'registered'
          ? Math.max((event.currentAttendees || 1) - 1, 0)
          : event.currentAttendees,
        isFull: false
      })

      // Refresh attendees list
      await fetchAttendees()
      setError('')
    } catch (err) {
      console.error('Failed to leave event:', err)
      setError('Failed to leave event. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!event) return

    try {
      setActionLoading(true)
      await eventApi.approveEvent(event.id)
      await fetchEvent()
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to approve event')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!event || !revisionComments.trim()) {
      setError('Revision comments are required')
      return
    }

    try {
      setActionLoading(true)
      await eventApi.requestRevision(event.id, revisionComments.trim())
      setShowRevisionModal(false)
      setRevisionComments('')
      await fetchEvent()
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to request revision')
    } finally {
      setActionLoading(false)
    }
  }

  const openRevisionModal = () => {
    setShowRevisionModal(true)
    setRevisionComments('')
    setError('')
  }

  const closeRevisionModal = () => {
    setShowRevisionModal(false)
    setRevisionComments('')
    setError('')
  }

  const exportAttendees = async () => {
    if (!event) return

    try {
      const token = getToken()
      if (!token) {
        setError('No authentication token found')
        return
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/attendees/export/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export attendees')
      }

      // Get the CSV content
      const csvContent = await response.text()

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_attendees.csv`
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition)
        if (matches && matches[1]) {
          filename = matches[1]
        }
      }

      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export attendees:', err)
      setError('Failed to export attendees. Please try again.')
    }
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

        {/* Action Buttons */}
        {user && (
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {/* Creator Actions */}
              {user.id === event.createdBy && (
                <>
                  {/* Edit Button */}
                  {(event.status === 'draft' || event.status === 'revision_requested') && (
                    <button
                      onClick={handleEdit}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Edit
                    </button>
                  )}

                  {/* Submit for Approval Button - only for regular users */}
                  {(event.status === 'draft' || event.status === 'revision_requested') && user.role === 'user' && (
                    <button
                      onClick={handleSubmitForApproval}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Submit for Approval
                    </button>
                  )}

                  {/* Publish Button - for approvers/admins/superadmins */}
                  {event.status === 'draft' && ['approver', 'admin', 'superadmin'].includes(user.role) && (
                    <button
                      onClick={handlePublish}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Publish
                    </button>
                  )}

                  {/* Cancel Button */}
                  {event.status === 'published' && (
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Cancel Event
                    </button>
                  )}

                  {/* Delete Button */}
                  {(event.status === 'draft' || event.status === 'revision_requested') && (
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Delete
                    </button>
                  )}

                  {/* Export Attendees Button - for event creators */}
                  {attendees.length > 0 && (
                    <button
                      onClick={exportAttendees}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      📥 Export Attendees
                    </button>
                  )}
                </>
              )}

              {/* Approver/Admin Actions */}
              {user.id !== event.createdBy && ['approver', 'admin', 'superadmin'].includes(user.role) && (
                <>
                  {/* Approve Button */}
                  {event.status === 'pending_approval' && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Approve
                    </button>
                  )}

                  {/* Request Revision Button */}
                  {event.status === 'pending_approval' && (
                    <button
                      onClick={openRevisionModal}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Request Revision
                    </button>
                  )}
                </>
              )}

              {/* Registration Actions - for non-creators */}
              {user.id !== event.createdBy && event.status === 'published' && (
                <>
                  {/* Register Button */}
                  {!event.isUserRegistered && event.canRegister && event.hasRegistrationStarted && !event.isFull && (
                    <button
                      onClick={handleJoinEvent}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Register for Event
                    </button>
                  )}

                  {/* Leave Button */}
                  {event.isUserRegistered && (
                    <button
                      onClick={handleLeaveEvent}
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      Leave Event
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Display revision comments if present */}
            {event.revisionComments && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                borderRadius: '4px',
                border: '1px solid #ffeeba',
                fontSize: '14px'
              }}>
                <strong>Revision Comments:</strong>
                <div style={{ marginTop: '4px' }}>{event.revisionComments}</div>
              </div>
            )}
          </div>
        )}

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

        {/* Approval History Section - Only visible to event creator, approvers, and admins */}
        {user && (
          user.id === event.createdBy ||
          user.role === 'approver' ||
          user.role === 'admin' ||
          user.role === 'superadmin'
        ) && approvalHistory.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            {approvalHistoryLoading ? (
              <div style={{
                textAlign: 'center',
                color: '#6c757d',
                padding: '20px'
              }}>
                Loading approval history...
              </div>
            ) : (
              <EventApprovalHistoryComponent history={approvalHistory} />
            )}
          </div>
        )}

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

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            position: 'relative',
          }}>
            <h3 style={{ marginBottom: '15px' }}>Request Revision</h3>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Event: <strong>{event.title}</strong>
            </p>

            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Revision Comments (Required):
            </label>
            <textarea
              value={revisionComments}
              onChange={(e) => setRevisionComments(e.target.value)}
              placeholder="Please explain what needs to be revised..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '20px',
                resize: 'vertical',
                fontSize: '14px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRequestRevision}
                disabled={!revisionComments.trim() || actionLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!revisionComments.trim() || actionLoading) ? 'not-allowed' : 'pointer',
                  opacity: (!revisionComments.trim() || actionLoading) ? 0.7 : 1,
                  fontWeight: '500'
                }}
              >
                {actionLoading ? 'Processing...' : 'Send Revision Request'}
              </button>

              <button
                onClick={closeRevisionModal}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetailsPage