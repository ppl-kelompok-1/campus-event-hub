import { useState } from 'react'
import { eventApi, API_BASE_URL } from '../auth/api'
import type { EventAttachment } from '../auth/api'
import { useAuth } from '../auth/AuthContext'

interface AttachmentListProps {
  attachments: EventAttachment[]
  eventCreatorId?: number
  onDeleteSuccess: (attachmentId: number) => void
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  eventCreatorId,
  onDeleteSuccess
}) => {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState<number | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const canDelete = (attachment: EventAttachment): boolean => {
    if (!user) return false
    // User can delete if they uploaded it, or they created the event, or they're admin
    return (
      attachment.uploadedBy === user.id ||
      eventCreatorId === user.id ||
      user.role === 'admin' ||
      user.role === 'superadmin'
    )
  }

  const handleDelete = async (attachment: EventAttachment) => {
    if (!confirm(`Are you sure you want to delete "${attachment.originalName}"?`)) {
      return
    }

    setDeleting(attachment.id)
    try {
      await eventApi.deleteAttachment(attachment.eventId, attachment.id)
      onDeleteSuccess(attachment.id)
    } catch (err: any) {
      alert(err.message || 'Failed to delete attachment')
    } finally {
      setDeleting(null)
    }
  }

  if (attachments.length === 0) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#6c757d',
        border: '1px solid #e9ecef'
      }}>
        No attachments yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: '500',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '4px'
            }}>
              {attachment.originalName}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              {formatFileSize(attachment.fileSize)} · Uploaded by {attachment.uploaderName} ·{' '}
              {new Date(attachment.uploadedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          <a
            href={`${API_BASE_URL}${attachment.downloadUrl}`}
            download
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            Download
          </a>

          {canDelete(attachment) && (
            <button
              onClick={() => handleDelete(attachment)}
              disabled={deleting === attachment.id}
              style={{
                padding: '6px 12px',
                backgroundColor: deleting === attachment.id ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: deleting === attachment.id ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {deleting === attachment.id ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
