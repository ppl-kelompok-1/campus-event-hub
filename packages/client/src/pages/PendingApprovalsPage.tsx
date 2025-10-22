import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { eventApi, type Event } from '../auth/api'
import EventCard from '../components/EventCard'

const PendingApprovalsPage = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showRevisionModal, setShowRevisionModal] = useState<{ eventId: number; title: string } | null>(null)
  const [revisionComments, setRevisionComments] = useState('')
  const { user } = useAuth()

  // Check if user has approval permissions
  if (!user || (user.role !== 'approver' && user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    )
  }

  useEffect(() => {
    loadPendingEvents()
  }, [])

  const loadPendingEvents = async () => {
    try {
      setLoading(true)
      const response = await eventApi.getPendingApprovalEvents()
      setEvents(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load pending events')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: number) => {
    try {
      setActionLoading(eventId)
      await eventApi.approveEvent(eventId)
      // Remove approved event from list (it's now published)
      setEvents(events.filter(event => event.id !== eventId))
    } catch (err: any) {
      setError(err.message || 'Failed to approve event')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestRevision = async () => {
    if (!showRevisionModal || !revisionComments.trim()) {
      setError('Revision comments are required')
      return
    }

    try {
      setActionLoading(showRevisionModal.eventId)
      await eventApi.requestRevision(showRevisionModal.eventId, revisionComments.trim())
      // Reload the page to show updated status instead of removing
      await loadPendingEvents()
      // Close modal
      setShowRevisionModal(null)
      setRevisionComments('')
    } catch (err: any) {
      setError(err.message || 'Failed to request revision')
    } finally {
      setActionLoading(null)
    }
  }

  const openRevisionModal = (eventId: number, title: string) => {
    setShowRevisionModal({ eventId, title })
    setRevisionComments('')
    setError('')
  }

  const closeRevisionModal = () => {
    setShowRevisionModal(null)
    setRevisionComments('')
    setError('')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; text: string; icon: string }> = {
      pending_approval: { bg: '#fff3cd', color: '#856404', text: 'Pending Approval', icon: '🟡' },
      revision_requested: { bg: '#ffe5cc', color: '#cc6600', text: 'Revision Requested', icon: '🟠' }
    }

    const config = statusConfig[status] || statusConfig.pending_approval

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bg,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Loading pending approvals...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Pending Approvals</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Events waiting for your approval. Review and approve or request revisions.
      </p>
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <h3>No Pending Approvals</h3>
          <p style={{ color: '#666' }}>All events have been processed.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px' 
        }}>
          {events.map((event) => (
            <div key={event.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <EventCard event={event} />

              <div style={{
                padding: '15px',
                borderTop: '1px solid #eee',
                backgroundColor: '#f8f9fa'
              }}>
                {/* Status Badge */}
                <div style={{ marginBottom: '12px' }}>
                  {getStatusBadge(event.status)}
                </div>

                {/* Event Info */}
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  <strong>Created by:</strong> {event.creatorName}
                </p>

                <p style={{
                  fontSize: '13px',
                  color: '#888',
                  marginBottom: '12px'
                }}>
                  Last updated: {formatDate(event.updatedAt)}
                </p>

                {/* Revision Comments (if status is revision_requested) */}
                {event.status === 'revision_requested' && event.revisionComments && (
                  <div style={{
                    backgroundColor: '#ffe5cc',
                    border: '1px solid #ffcc99',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '12px'
                  }}>
                    <strong style={{ fontSize: '13px', color: '#cc6600' }}>Revision Comments:</strong>
                    <p style={{
                      fontSize: '13px',
                      color: '#cc6600',
                      marginTop: '4px',
                      marginBottom: 0
                    }}>
                      {event.revisionComments}
                    </p>
                  </div>
                )}

                {/* Approver Info (if already has approver) */}
                {event.approverName && (
                  <p style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '12px'
                  }}>
                    <strong>Reviewed by:</strong> {event.approverName}
                  </p>
                )}

                {/* Action Buttons - Conditional based on status */}
                {event.status === 'pending_approval' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(event.id)}
                      disabled={actionLoading === event.id}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading === event.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === event.id ? 0.7 : 1,
                      }}
                    >
                      {actionLoading === event.id ? 'Processing...' : 'Approve'}
                    </button>

                    <button
                      onClick={() => openRevisionModal(event.id, event.title)}
                      disabled={actionLoading === event.id}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: actionLoading === event.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === event.id ? 0.7 : 1,
                      }}
                    >
                      Request Revision
                    </button>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #a5d6a7',
                    borderRadius: '6px',
                    padding: '10px',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#2e7d32',
                      marginBottom: '6px',
                      fontWeight: '600'
                    }}>
                      ✓ Waiting for creator to address feedback
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#4caf50',
                      marginBottom: 0
                    }}>
                      Event will reappear when resubmitted for approval
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revision Modal */}
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
              Event: <strong>{showRevisionModal.title}</strong>
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
              }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRequestRevision}
                disabled={!revisionComments.trim() || actionLoading === showRevisionModal.eventId}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!revisionComments.trim() || actionLoading === showRevisionModal.eventId) ? 'not-allowed' : 'pointer',
                  opacity: (!revisionComments.trim() || actionLoading === showRevisionModal.eventId) ? 0.7 : 1,
                }}
              >
                {actionLoading === showRevisionModal.eventId ? 'Processing...' : 'Send Revision Request'}
              </button>
              
              <button
                onClick={closeRevisionModal}
                disabled={actionLoading === showRevisionModal.eventId}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: actionLoading === showRevisionModal.eventId ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === showRevisionModal.eventId ? 0.7 : 1,
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

export default PendingApprovalsPage