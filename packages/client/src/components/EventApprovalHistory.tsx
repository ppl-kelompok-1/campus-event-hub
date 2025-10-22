import type { EventApprovalHistory } from '../auth/api'

interface EventApprovalHistoryProps {
  history: EventApprovalHistory[]
}

const EventApprovalHistoryComponent: React.FC<EventApprovalHistoryProps> = ({ history }) => {
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submitted':
        return '📤'
      case 'approved':
        return '✅'
      case 'revision_requested':
        return '📝'
      default:
        return '📋'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'submitted':
        return '#ffc107'
      case 'approved':
        return '#28a745'
      case 'revision_requested':
        return '#fd7e14'
      default:
        return '#6c757d'
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'submitted':
        return 'Submitted for Approval'
      case 'approved':
        return 'Approved'
      case 'revision_requested':
        return 'Revision Requested'
      default:
        return action
    }
  }

  if (!history || history.length === 0) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        No approval history available
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
        Approval History
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

        {history.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: index === history.length - 1 ? 0 : '24px',
              position: 'relative'
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: getActionColor(item.action),
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
              {getActionIcon(item.action)}
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
              {/* Action and Date */}
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
                  {getActionText(item.action)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6c757d'
                }}>
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {/* Performer */}
              <div style={{
                fontSize: '14px',
                color: '#495057',
                marginBottom: '4px'
              }}>
                By <strong>{item.performerName}</strong>
              </div>

              {/* Status Change */}
              <div style={{
                fontSize: '13px',
                color: '#6c757d',
                marginBottom: item.comments ? '8px' : 0
              }}>
                Status: <span style={{ textTransform: 'capitalize' }}>{item.statusBefore.replace('_', ' ')}</span>
                {' → '}
                <span style={{ textTransform: 'capitalize' }}>{item.statusAfter.replace('_', ' ')}</span>
              </div>

              {/* Comments (if any) */}
              {item.comments && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#856404'
                }}>
                  <strong>Comments:</strong> {item.comments}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventApprovalHistoryComponent
