import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Event } from '../auth/api'

interface EventTimelineItemProps {
  event: Event
  showJoinButton?: boolean
  showManagementActions?: boolean
  onJoin?: (event: Event) => void
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onPublish?: (event: Event) => void
  onCancel?: (event: Event) => void
  onSubmitForApproval?: (event: Event) => void
}

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({ 
  event, 
  showJoinButton = true,
  showManagementActions = false,
  onJoin,
  onEdit,
  onDelete,
  onPublish,
  onCancel,
  onSubmitForApproval
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
    }
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    // Local time
    const localTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    // GMT time (assuming GMT+7 for local time)
    const gmtDate = new Date(date.getTime() - (7 * 60 * 60 * 1000))
    const gmtTime = gmtDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit', 
      hour12: false
    })
    
    return { localTime, gmtTime }
  }

  const generateEventThumbnail = (title: string) => {
    // Generate a simple colored thumbnail based on event title
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)'
    ]
    
    const index = title.length % colors.length
    const initials = title.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    
    return { background: colors[index], initials }
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
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}
      >
        {status.replace('_', ' ')}
      </span>
    )
  }

  const formatDateTime = formatTime(event.eventTime)
  const dateInfo = formatDate(event.eventDate)
  const thumbnail = generateEventThumbnail(event.title)

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0px',
      marginBottom: '32px',
      alignItems: 'flex-start',
      position: 'relative'
    }}>
      {/* Date Sidebar */}
      <div style={{ 
        width: '80px',
        flexShrink: 0,
        textAlign: 'center',
        paddingTop: '8px'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#2c3e50',
          lineHeight: '1.2'
        }}>
          {dateInfo.day} {dateInfo.month}
        </div>
        <div style={{ 
          fontSize: '14px',
          color: '#6c757d',
          marginTop: '4px'
        }}>
          {dateInfo.dayName}
        </div>
      </div>

      {/* Timeline dot */}
      <div style={{
        width: '12px',
        height: '12px',
        backgroundColor: '#dee2e6',
        borderRadius: '50%',
        margin: '16px 24px 0 24px',
        flexShrink: 0,
        position: 'relative'
      }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '12px',
          transform: 'translateX(-50%)',
          width: '2px',
          height: '60px',
          backgroundColor: '#dee2e6',
          zIndex: -1
        }} />
      </div>

      {/* Event Content */}
      <div style={{ 
        flex: 1,
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative'
      }}>
        {/* Event Thumbnail - Moved inside card */}
        <div style={{ 
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: isMobile ? '60px' : '80px',
          height: isMobile ? '45px' : '60px',
          borderRadius: '6px',
          background: thumbnail.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: isMobile ? '16px' : '20px',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {thumbnail.initials}
        </div>

        {/* Time */}
        <div style={{ 
          fontSize: '14px',
          color: '#6c757d',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#95a5a6' }}>{formatDateTime.localTime}</span>
          <span style={{ margin: '0 8px', color: '#dee2e6' }}>·</span>
          <span style={{ color: '#f39c12', fontWeight: '500' }}>
            {formatDateTime.gmtTime} GMT+7
          </span>
        </div>

        {/* Event Title */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <h3 style={{ 
            margin: '0',
            fontSize: '20px',
            fontWeight: '700',
            color: '#2c3e50',
            lineHeight: '1.3',
            flex: 1,
            paddingRight: isMobile ? '70px' : '90px' // Make room for thumbnail
          }}>
            <Link 
              to={`/events/${event.id}`}
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              {event.title}
            </Link>
          </h3>
          {showManagementActions && getStatusBadge(event.status)}
        </div>

        {/* Organizer */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#6c757d'
          }}>
            👤
          </div>
          <span style={{ 
            fontSize: '14px',
            color: '#6c757d'
          }}>
            By {event.creatorName}
          </span>
        </div>

        {/* Location */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#6c757d'
          }}>
            📍
          </div>
          <span style={{ 
            fontSize: '14px',
            color: '#6c757d'
          }}>
            {event.location}
          </span>
        </div>

        {/* Revision Comments */}
        {event.revisionComments && (
          <div style={{ 
            margin: '0 0 16px 0',
            padding: '12px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong>Revision Required:</strong> {event.revisionComments}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p style={{ 
            margin: '0 0 16px 0',
            color: '#495057',
            lineHeight: '1.5',
            fontSize: '14px'
          }}>
            {event.description.length > 120 
              ? `${event.description.substring(0, 120)}...` 
              : event.description
            }
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Join Button for Browse Events */}
          {showJoinButton && !showManagementActions && (
            <button
              onClick={() => onJoin && onJoin(event)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff'
              }}
            >
              Join Event
            </button>
          )}

          {/* Management Actions for My Created Events */}
          {showManagementActions && (
            <>
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
                    fontSize: '12px',
                    fontWeight: '500'
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
                    fontSize: '12px',
                    fontWeight: '500'
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
                    fontSize: '12px',
                    fontWeight: '500'
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
                    fontSize: '12px',
                    fontWeight: '500'
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
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventTimelineItem