import { Link } from 'react-router-dom'
import type { Event, UserRole } from '../auth/api'

interface EventTimelineItemProps {
  event: Event
  showJoinButton?: boolean
  showManagementActions?: boolean
  userRole?: UserRole
  onJoin?: (event: Event) => void
  onLeave?: (event: Event) => void
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
  userRole,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
  onPublish,
  onCancel,
  onSubmitForApproval
}) => {
  // Remove unused mobile detection since we're no longer using thumbnails
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

  const formattedTime = formatTime(event.eventTime)
  const dateInfo = formatDate(event.eventDate)

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

        {/* Time */}
        <div style={{
          fontSize: '14px',
          color: '#6c757d',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#95a5a6' }}>{formattedTime.localTime}</span>
          <span style={{ margin: '0 8px', color: '#dee2e6' }}>·</span>
          <span style={{ color: '#f39c12', fontWeight: '500' }}>
            {formattedTime.gmtTime} GMT+7
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
            flex: 1
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
            By{' '}
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
            {event.locationName}
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

        {/* Attendee Count */}
        {event.currentAttendees !== undefined && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#6c757d'
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
              👥
            </div>
            <span>
              {event.currentAttendees}
              {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
              {event.isFull && <span style={{ color: '#dc3545', marginLeft: '8px' }}>(Full)</span>}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap'
        }}>
          {/* Smart Join/Leave Button for Browse Events */}
          {showJoinButton && !showManagementActions && (() => {
            // Determine button state and text
            let buttonText = 'Join Event';
            let buttonColor = '#007bff';
            let buttonHoverColor = '#0056b3';
            let isDisabled = false;
            let clickHandler = () => onJoin && onJoin(event);

            if (event.isUserRegistered) {
              if (event.userRegistrationStatus === 'registered') {
                buttonText = 'Joined ✓';
                buttonColor = '#28a745';
                buttonHoverColor = '#dc3545';
                clickHandler = () => onLeave && onLeave(event);
              } else if (event.userRegistrationStatus === 'waitlisted') {
                buttonText = 'On Waitlist';
                buttonColor = '#ffc107';
                buttonHoverColor = '#dc3545';
                clickHandler = () => onLeave && onLeave(event);
              }
            } else if (event.isFull) {
              buttonText = 'Event Full';
              buttonColor = '#6c757d';
              buttonHoverColor = '#6c757d';
              isDisabled = true;
              clickHandler = () => {};
            } else if (!event.hasRegistrationStarted) {
              const regDate = formatDate(event.registrationStartDate);
              buttonText = `Registration opens ${regDate.month} ${regDate.day}`;
              buttonColor = '#6c757d';
              buttonHoverColor = '#6c757d';
              isDisabled = true;
              clickHandler = () => {};
            } else if (!event.canRegister) {
              buttonText = 'Registration Closed';
              buttonColor = '#6c757d';
              buttonHoverColor = '#6c757d';
              isDisabled = true;
              clickHandler = () => {};
            }

            return (
              <button
                onClick={clickHandler}
                disabled={isDisabled}
                style={{
                  backgroundColor: buttonColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.backgroundColor = buttonHoverColor;
                    if (event.isUserRegistered) {
                      e.currentTarget.textContent = 'Leave Event';
                    }
                  }
                }}
                onMouseOut={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.backgroundColor = buttonColor;
                    e.currentTarget.textContent = buttonText;
                  }
                }}
              >
                {buttonText}
              </button>
            );
          })()}

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
              
              {onSubmitForApproval && (event.status === 'draft' || event.status === 'revision_requested') && userRole === 'user' && (
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
              
              {onPublish && event.status === 'draft' && userRole && ['approver', 'admin', 'superadmin'].includes(userRole) && (
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