import { useState, useRef } from 'react'
import { eventApi } from '../auth/api'
import type { EventAttachment } from '../auth/api'

interface FileUploadProps {
  eventId: number
  onUploadSuccess: (attachment: EventAttachment) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({ eventId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      const response = await eventApi.uploadAttachment(eventId, file)
      onUploadSuccess(response.data)

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        Upload Attachment
      </label>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt"
          style={{
            padding: '8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            flex: 1
          }}
        />

        {uploading && (
          <span style={{ color: '#007bff' }}>Uploading...</span>
        )}
      </div>

      {error && (
        <div style={{
          color: '#dc3545',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          {error}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
        Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, WEBP, TXT (max 10MB)
      </div>
    </div>
  )
}
