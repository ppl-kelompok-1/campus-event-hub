import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { eventApi, type Event } from '../auth/api'
import Pagination from '../components/Pagination'

type StatusFilter = 'all' | 'pending_approval' | 'revision_requested' | 'published'

const PendingApprovalsPage = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showRevisionModal, setShowRevisionModal] = useState<{ eventId: number; title: string } | null>(null)
  const [revisionComments, setRevisionComments] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()

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
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    filterEvents()
  }, [events, statusFilter, searchQuery])

  const loadPendingEvents = async () => {
    try {
      setLoading(true)

      // Debug: Log pagination parameters being sent
      console.log('🔍 Fetching pending events - Page:', currentPage, 'Limit:', itemsPerPage)

      const response = await eventApi.getPendingApprovalEvents(currentPage, itemsPerPage)

      // Defensive: Check if response has expected structure
      if (!response) {
        throw new Error('Invalid response from server')
      }

      // Debug: Log what API actually returned
      console.log('📦 API Response:')
      console.log('  - Events returned:', response.data?.length || 0)
      console.log('  - Pagination metadata:', response.pagination)
      console.log('  - Expected limit:', itemsPerPage)

      // Alert if backend returned more events than requested
      if (response.data && response.data.length > itemsPerPage) {
        console.warn('⚠️ Backend returned MORE events than requested!')
        console.warn(`   Expected: ${itemsPerPage}, Got: ${response.data.length}`)
        console.warn('   Backend pagination may not be working correctly.')
      }

      // Set events data
      setEvents(response.data || [])

      // Defensive: Use optional chaining and provide defaults
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalItems(response.pagination?.total || 0)

      // Log for debugging if pagination is missing
      if (!response.pagination) {
        console.warn('API response missing pagination metadata:', response)
      }
    } catch (err: any) {
      console.error('Error loading pending events:', err)
      setError(err.message || 'Failed to load events')
      // Reset to safe defaults on error
      setEvents([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const filterEvents = () => {
    let filtered = events

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.creatorName.toLowerCase().includes(query) ||
        event.locationName.toLowerCase().includes(query)
      )
    }

    setFilteredEvents(filtered)
  }

  const handleApprove = async (eventId: number) => {
    try {
      setActionLoading(eventId)
      await eventApi.approveEvent(eventId)
      await loadPendingEvents()
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
      await loadPendingEvents()
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
      pending_approval: { bg: '#fff3cd', color: '#856404', text: 'Pending', icon: '🟡' },
      revision_requested: { bg: '#ffe5cc', color: '#cc6600', text: 'Revision', icon: '🟠' },
      published: { bg: '#d4edda', color: '#155724', text: 'Approved', icon: '✅' }
    }

    const config = statusConfig[status] || statusConfig.pending_approval

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap'
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
      year: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilterCount = (filter: StatusFilter) => {
    if (filter === 'all') return events.length
    return events.filter(e => e.status === filter).length
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Loading approval workflow...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Approval Workflow</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Manage all events in the approval process
        </p>
      </div>

      {error && (
        <div style={{
          color: '#721c24',
          backgroundColor: '#f8d7da',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['all', 'pending_approval', 'revision_requested', 'published'] as StatusFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '8px 16px',
                backgroundColor: statusFilter === filter ? '#007bff' : '#f8f9fa',
                color: statusFilter === filter ? 'white' : '#495057',
                border: '1px solid',
                borderColor: statusFilter === filter ? '#007bff' : '#dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {filter === 'all' ? 'All' : filter === 'pending_approval' ? 'Pending' : filter === 'revision_requested' ? 'Revision' : 'Approved'}
              <span style={{
                marginLeft: '6px',
                opacity: 0.8,
                fontSize: '12px'
              }}>
                ({getFilterCount(filter)})
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by title, creator, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Table */}
      {filteredEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#666', marginBottom: '8px' }}>No Events Found</h3>
          <p style={{ color: '#999', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search query' : 'No events match the selected filter'}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Event Title</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Creator</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Event Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Location</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Last Updated</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Reviewer</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <tr
                    key={event.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      borderBottom: '1px solid #dee2e6',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <a
                        href={`/events/${event.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/events/${event.id}`)
                        }}
                        style={{
                          color: '#007bff',
                          textDecoration: 'none',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none'
                        }}
                        title={event.description || event.title}
                      >
                        {event.title}
                      </a>
                      {event.revisionComments && (
                        <div style={{
                          fontSize: '12px',
                          color: '#cc6600',
                          marginTop: '4px',
                          fontStyle: 'italic'
                        }} title={event.revisionComments}>
                          💬 {event.revisionComments.length > 50 ? event.revisionComments.substring(0, 50) + '...' : event.revisionComments}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#495057' }}>{event.creatorName}</td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(event.status)}</td>
                    <td style={{ padding: '12px 16px', color: '#495057', whiteSpace: 'nowrap' }}>{formatDate(event.eventDate)}</td>
                    <td style={{ padding: '12px 16px', color: '#495057' }}>{event.locationName}</td>
                    <td style={{ padding: '12px 16px', color: '#6c757d', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatDateTime(event.updatedAt)}</td>
                    <td style={{ padding: '12px 16px', color: '#495057' }}>{event.approverName || '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {event.status === 'pending_approval' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApprove(event.id)}
                            disabled={actionLoading === event.id}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: actionLoading === event.id ? 'not-allowed' : 'pointer',
                              opacity: actionLoading === event.id ? 0.7 : 1,
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {actionLoading === event.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => openRevisionModal(event.id, event.title)}
                            disabled={actionLoading === event.id}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: actionLoading === event.id ? 'not-allowed' : 'pointer',
                              opacity: actionLoading === event.id ? 0.7 : 1,
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Revision
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredEvents.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
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
                fontSize: '14px'
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
                  fontWeight: '500'
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
                  fontWeight: '500'
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
