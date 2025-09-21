import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Event } from '../auth/api'

interface EventTimelineItemProps {
  event: Event
  showJoinButton?: boolean
  onJoin?: (event: Event) => void
}

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({ 
  event, 
  showJoinButton = true,
  onJoin
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
      dayName: date.toLocaleDateString('id-ID', { weekday: 'long' })
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
        marginRight: '20px'
      }}>
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
        <h3 style={{ 
          margin: '0 0 12px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: '#2c3e50',
          lineHeight: '1.3'
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
            Oleh {event.creatorName}
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

        {/* Join Button */}
        {showJoinButton && (
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
            Diundang
          </button>
        )}
      </div>

      {/* Event Thumbnail */}
      <div style={{ 
        width: isMobile ? '80px' : '120px',
        height: isMobile ? '60px' : '80px',
        borderRadius: '8px',
        background: thumbnail.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: isMobile ? '18px' : '24px',
        fontWeight: '600',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {thumbnail.initials}
      </div>
    </div>
  )
}

export default EventTimelineItem