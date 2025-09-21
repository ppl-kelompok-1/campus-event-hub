import { Link } from 'react-router-dom'
import type { Event } from '../auth/api'

interface EventCardProps {
  event: Event
  showActions?: boolean
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onPublish?: (event: Event) => void
  onCancel?: (event: Event) => void
  onSubmitForApproval?: (event: Event) => void
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onPublish, 
  onCancel,
  onSubmitForApproval
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
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
      pending_approval: { backgroundColor: '#ffc107', color: '#212529' },
      revision_requested: { backgroundColor: '#fd7e14', color: 'white' },
      published: { backgroundColor: '#28a745', color: 'white' },
      cancelled: { backgroundColor: '#dc3545', color: 'white' },
      completed: { backgroundColor: '#007bff', color: 'white' }
    }

    return (
      <span 
        style={{
          ...(statusStyles[status] || statusStyles.draft),
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}
      >
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
          <Link 
            to={`/events/${event.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {event.title}
          </Link>
        </h3>
        {getStatusBadge(event.status)}
      </div>

      <div style={{ marginBottom: '12px', color: '#6c757d', fontSize: '0.9rem' }}>
        <div style={{ marginBottom: '4px' }}>
          📅 {formatDate(event.eventDate)} at {formatTime(event.eventTime)}
        </div>
        <div style={{ marginBottom: '4px' }}>
          📍 {event.location}
        </div>
        <div style={{ marginBottom: '4px' }}>
          👤 By {event.creatorName}
        </div>
        {event.maxAttendees && (
          <div>
            👥 Max {event.maxAttendees} attendees
          </div>
        )}
        {event.approverName && (
          <div style={{ marginBottom: '4px' }}>
            ✅ Approved by {event.approverName}
          </div>
        )}
      </div>

      {event.revisionComments && (
        <div style={{ 
          margin: '0 0 16px 0',
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <strong>Revision Required:</strong> {event.revisionComments}
        </div>
      )}

      {event.description && (
        <p style={{ 
          margin: '0 0 16px 0',
          color: '#495057',
          lineHeight: '1.5',
          maxHeight: '60px',
          overflow: 'hidden'
        }}>
          {event.description.length > 150 
            ? `${event.description.substring(0, 150)}...` 
            : event.description
          }
        </p>
      )}

      {showActions && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onEdit && (event.status === 'draft' || event.status === 'revision_requested') && (
            <button
              onClick={() => onEdit(event)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Edit
            </button>
          )}
          
          {onSubmitForApproval && (event.status === 'draft' || event.status === 'revision_requested') && (
            <button
              onClick={() => onSubmitForApproval(event)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Submit for Approval
            </button>
          )}
          
          {onPublish && event.status === 'draft' && (
            <button
              onClick={() => onPublish(event)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Publish
            </button>
          )}
          
          {onCancel && event.status === 'published' && (
            <button
              onClick={() => onCancel(event)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ffc107',
                color: '#212529',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>
          )}
          
          {onDelete && (event.status === 'draft' || event.status === 'revision_requested') && (
            <button
              onClick={() => onDelete(event)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCard