import { useState } from 'react'
import { eventApi, type CreateEventMessageDto } from '../auth/api'

interface EventMessageFormProps {
  eventId: number
  onMessageSent?: () => void
}

const MAX_SUBJECT_LENGTH = 200
const MAX_MESSAGE_LENGTH = 2000

const EventMessageForm: React.FC<EventMessageFormProps> = ({ eventId, onMessageSent }) => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!subject.trim() || subject.trim().length === 0) {
      setError('Subject is required')
      return
    }

    if (!message.trim() || message.trim().length === 0) {
      setError('Message is required')
      return
    }

    if (subject.length > MAX_SUBJECT_LENGTH) {
      setError(`Subject must be ${MAX_SUBJECT_LENGTH} characters or less`)
      return
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`)
      return
    }

    setSending(true)

    try {
      const messageData: CreateEventMessageDto = {
        subject: subject.trim(),
        message: message.trim()
      }

      const response = await eventApi.sendMessage(eventId, messageData)

      setSuccess(`Message sent successfully to ${response.data.recipientCount} attendee(s)!`)
      setSubject('')
      setMessage('')

      // Call parent callback if provided
      if (onMessageSent) {
        onMessageSent()
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '16px'
      }}>
        Send Message to Attendees
      </h3>

      <p style={{
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '24px'
      }}>
        Send a message to all registered attendees. They will receive an email notification.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Subject Field */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="subject"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '14px'
            }}
          >
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter message subject"
            maxLength={MAX_SUBJECT_LENGTH}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
          />
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            marginTop: '4px',
            textAlign: 'right'
          }}>
            {subject.length}/{MAX_SUBJECT_LENGTH}
          </div>
        </div>

        {/* Message Field */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="message"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '14px'
            }}
          >
            Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            maxLength={MAX_MESSAGE_LENGTH}
            rows={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'border-color 0.15s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
          />
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            marginTop: '4px',
            textAlign: 'right'
          }}>
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c2c7',
            borderRadius: '6px',
            color: '#842029',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#d1e7dd',
            border: '1px solid #badbcc',
            borderRadius: '6px',
            color: '#0f5132',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={sending || !subject.trim() || !message.trim()}
          style={{
            width: '100%',
            padding: '12px 24px',
            backgroundColor: sending || !subject.trim() || !message.trim() ? '#6c757d' : '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: sending || !subject.trim() || !message.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
            opacity: sending ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!sending && subject.trim() && message.trim()) {
              e.currentTarget.style.backgroundColor = '#0056b3'
            }
          }}
          onMouseLeave={(e) => {
            if (!sending && subject.trim() && message.trim()) {
              e.currentTarget.style.backgroundColor = '#007bff'
            }
          }}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

export default EventMessageForm
