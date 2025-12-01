import { useState, useEffect } from 'react'
import { eventApi, type EventMessage } from '../auth/api'

interface EventMessageHistoryProps {
  eventId: number
  refreshTrigger?: number // Increment this to trigger a refresh
}

const EventMessageHistory: React.FC<EventMessageHistoryProps> = ({ eventId, refreshTrigger }) => {
  const [messages, setMessages] = useState<EventMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await eventApi.getEventMessages(eventId)
      setMessages(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load message history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [eventId, refreshTrigger])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleExpand = (messageId: number) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId)
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        Loading message history...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c2c7',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#842029'
      }}>
        {error}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        No messages sent yet
      </div>
    )
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '16px'
      }}>
        Message History
      </h3>

      <div style={{ position: 'relative' }}>
        {/* Vertical timeline line */}
        <div style={{
          position: 'absolute',
          left: '19px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          backgroundColor: '#dee2e6'
        }} />

        {messages.map((msg, index) => {
          const isExpanded = expandedMessageId === msg.id

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: index === messages.length - 1 ? 0 : '24px',
                position: 'relative'
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                  zIndex: 1,
                  border: '3px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                ✉️
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {/* Subject and Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#2c3e50',
                    fontSize: '15px'
                  }}>
                    {msg.subject}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6c757d'
                  }}>
                    {formatDate(msg.sentAt)}
                  </div>
                </div>

                {/* Sender and Recipients */}
                <div style={{
                  fontSize: '14px',
                  color: '#495057',
                  marginBottom: '8px'
                }}>
                  Sent by <strong>{msg.senderName}</strong> to{' '}
                  <strong>{msg.recipientCount}</strong>{' '}
                  {msg.recipientCount === 1 ? 'attendee' : 'attendees'}
                </div>

                {/* Message Preview/Full */}
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#495057',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  maxHeight: isExpanded ? 'none' : '80px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {msg.message}
                  {/* Fade overlay when collapsed and message is long */}
                  {!isExpanded && msg.message.length > 150 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40px',
                      background: 'linear-gradient(to bottom, transparent, #f8f9fa)'
                    }} />
                  )}
                </div>

                {/* Expand/Collapse Button */}
                {msg.message.length > 150 && (
                  <button
                    onClick={() => toggleExpand(msg.id)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#007bff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EventMessageHistory
