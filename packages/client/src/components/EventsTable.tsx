import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Event, EventStatus } from '../auth/api'
import Pagination from './Pagination'

export type StatusFilterType = 'all' | EventStatus

export interface EventsTableAction {
  type: 'register' | 'leave' | 'edit' | 'delete' | 'publish' | 'submit' | 'cancel' | 'view'
  label: string
  color: string
  hoverColor?: string
  condition?: (event: Event) => boolean
  handler: (event: Event) => void | Promise<void>
}

export interface EventsTableProps {
  events: Event[]
  loading?: boolean
  error?: string
  showStatusFilters?: boolean
  statusFilterOptions?: StatusFilterType[]
  showDateFilters?: boolean
  showSearch?: boolean
  actions?: EventsTableAction[]
  emptyMessage?: string
  emptyDescription?: string
  // Pagination props
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading = false,
  error = '',
  showStatusFilters = false,
  statusFilterOptions = ['all', 'draft', 'pending_approval', 'revision_requested', 'published', 'cancelled'],
  showDateFilters = false,
  showSearch = true,
  actions = [],
  emptyMessage = 'No Events Found',
  emptyDescription = 'There are no events to display.',
  pagination,
  onPageChange,
  onItemsPerPageChange
}) => {
  const navigate = useNavigate()
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [showColumnFilters, setShowColumnFilters] = useState(false)
  const [columnSearches, setColumnSearches] = useState({
    title: '',
    creator: '',
    status: '',
    location: '',
    date: ''
  })

  // Helper function for date formatting
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Filter events whenever filters change
  useEffect(() => {
    filterEvents()
  }, [events, statusFilter, dateFilter, columnSearches])

  const filterEvents = () => {
    let filtered = [...events]

    // Status filter
    if (showStatusFilters && statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter)
    }

    // Date filter
    if (showDateFilters && dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.eventDate)
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

        if (dateFilter === 'upcoming') {
          return eventDateOnly >= today
        } else {
          return eventDateOnly < today
        }
      })
    }

    // Multi-column search filters (AND logic)
    if (showSearch) {
      if (columnSearches.title.trim()) {
        filtered = filtered.filter(event =>
          event.title.toLowerCase().includes(columnSearches.title.toLowerCase())
        )
      }
      if (columnSearches.creator.trim()) {
        filtered = filtered.filter(event =>
          event.creatorName.toLowerCase().includes(columnSearches.creator.toLowerCase())
        )
      }
      if (columnSearches.status.trim()) {
        filtered = filtered.filter(event =>
          event.status.toLowerCase().includes(columnSearches.status.toLowerCase())
        )
      }
      if (columnSearches.location.trim()) {
        filtered = filtered.filter(event =>
          event.locationName.toLowerCase().includes(columnSearches.location.toLowerCase())
        )
      }
      if (columnSearches.date.trim()) {
        filtered = filtered.filter(event =>
          formatDate(event.eventDate).toLowerCase().includes(columnSearches.date.toLowerCase())
        )
      }
    }

    setFilteredEvents(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; text: string; icon: string }> = {
      draft: { bg: '#e9ecef', color: '#495057', text: 'Draft', icon: '📝' },
      pending_approval: { bg: '#fff3cd', color: '#856404', text: 'Pending', icon: '🟡' },
      revision_requested: { bg: '#ffe5cc', color: '#cc6600', text: 'Revision', icon: '🟠' },
      published: { bg: '#d4edda', color: '#155724', text: 'Published', icon: '✅' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelled', icon: '❌' }
    }

    const config = statusConfig[status] || statusConfig.draft

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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getCountForStatus = (status: StatusFilterType) => {
    if (status === 'all') return events.length
    return events.filter(e => e.status === status).length
  }

  const getStatusFilterLabel = (status: StatusFilterType) => {
    const labels: Record<string, string> = {
      all: 'All',
      draft: 'Draft',
      pending_approval: 'Pending',
      revision_requested: 'Revision',
      published: 'Published',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading events...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Filters Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e9ecef'
      }}>
        {/* Status Filter Tabs */}
        {showStatusFilters && (
          <div style={{ marginBottom: showSearch || showDateFilters ? '16px' : '0' }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {statusFilterOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: statusFilter === status ? '2px solid #007bff' : '1px solid #dee2e6',
                    borderRadius: '6px',
                    backgroundColor: statusFilter === status ? '#e7f3ff' : 'white',
                    color: statusFilter === status ? '#007bff' : '#6c757d',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {getStatusFilterLabel(status)} ({getCountForStatus(status)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Filter Tabs */}
        {showDateFilters && (
          <div style={{ marginBottom: showSearch ? '16px' : '0' }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setDateFilter('all')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: dateFilter === 'all' ? '2px solid #007bff' : '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: dateFilter === 'all' ? '#e7f3ff' : 'white',
                  color: dateFilter === 'all' ? '#007bff' : '#6c757d',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                All Events
              </button>
              <button
                onClick={() => setDateFilter('upcoming')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: dateFilter === 'upcoming' ? '2px solid #007bff' : '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: dateFilter === 'upcoming' ? '#e7f3ff' : 'white',
                  color: dateFilter === 'upcoming' ? '#007bff' : '#6c757d',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Upcoming
              </button>
              <button
                onClick={() => setDateFilter('past')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: dateFilter === 'past' ? '2px solid #007bff' : '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: dateFilter === 'past' ? '#e7f3ff' : 'white',
                  color: dateFilter === 'past' ? '#007bff' : '#6c757d',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Past
              </button>
            </div>
          </div>
        )}

        {/* Toggle Column Filters Button */}
        {showSearch && (
          <div>
            <button
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                border: showColumnFilters ? '2px solid #007bff' : '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: showColumnFilters ? '#e7f3ff' : 'white',
                color: showColumnFilters ? '#007bff' : '#6c757d',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔍 {showColumnFilters ? 'Hide' : 'Show'} Column Filters
            </button>
          </div>
        )}
      </div>

      {/* Column Filter Row */}
      {showSearch && showColumnFilters && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '25% 15% 12% 12% 15% 10% 12% 150px',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Event Title Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search title..."
                value={columnSearches.title}
                onChange={(e) => setColumnSearches({...columnSearches, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 28px 8px 10px',
                  fontSize: '13px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              {columnSearches.title && (
                <button
                  onClick={() => setColumnSearches({...columnSearches, title: ''})}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    fontSize: '16px',
                    padding: '0 4px'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Creator Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search creator..."
                value={columnSearches.creator}
                onChange={(e) => setColumnSearches({...columnSearches, creator: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 28px 8px 10px',
                  fontSize: '13px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              {columnSearches.creator && (
                <button
                  onClick={() => setColumnSearches({...columnSearches, creator: ''})}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    fontSize: '16px',
                    padding: '0 4px'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Status Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search status..."
                value={columnSearches.status}
                onChange={(e) => setColumnSearches({...columnSearches, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 28px 8px 10px',
                  fontSize: '13px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              {columnSearches.status && (
                <button
                  onClick={() => setColumnSearches({...columnSearches, status: ''})}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    fontSize: '16px',
                    padding: '0 4px'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Event Date Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search date..."
                value={columnSearches.date}
                onChange={(e) => setColumnSearches({...columnSearches, date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 28px 8px 10px',
                  fontSize: '13px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              {columnSearches.date && (
                <button
                  onClick={() => setColumnSearches({...columnSearches, date: ''})}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    fontSize: '16px',
                    padding: '0 4px'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Location Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search location..."
                value={columnSearches.location}
                onChange={(e) => setColumnSearches({...columnSearches, location: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 28px 8px 10px',
                  fontSize: '13px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              {columnSearches.location && (
                <button
                  onClick={() => setColumnSearches({...columnSearches, location: ''})}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    fontSize: '16px',
                    padding: '0 4px'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Empty cells for Attendees, Last Updated, Actions */}
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          color: '#6c757d',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '24px',
            color: '#495057'
          }}>
            {emptyMessage}
          </h3>
          <p style={{
            margin: '0',
            fontSize: '16px'
          }}>
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e9ecef',
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Event Title
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Creator
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Event Date
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Location
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Attendees
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Last Updated
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#495057',
                  whiteSpace: 'nowrap'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, index) => (
                <tr
                  key={event.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                    borderBottom: '1px solid #e9ecef',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e7f3ff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div>
                      <div
                        onClick={() => navigate(`/events/${event.id}`)}
                        style={{
                          color: '#007bff',
                          fontWeight: '500',
                          cursor: 'pointer',
                          marginBottom: event.revisionComments ? '6px' : '0'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none'
                        }}
                      >
                        {event.title}
                      </div>
                      {event.revisionComments && (
                        <div style={{
                          fontSize: '12px',
                          color: '#856404',
                          backgroundColor: '#fff3cd',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginTop: '4px'
                        }}>
                          ⚠️ Revision: {event.revisionComments}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      onClick={() => navigate(`/users/${event.createdBy}/profile`)}
                      style={{
                        color: '#007bff',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none'
                      }}
                    >
                      {event.creatorName}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(event.status)}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {formatDate(event.eventDate)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {event.locationName}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {event.currentAttendees !== undefined ? (
                      <>
                        {event.currentAttendees}
                        {event.maxAttendees && ` / ${event.maxAttendees}`}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#6c757d' }}>
                    {formatDateTime(event.updatedAt)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {actions
                        .filter(action => !action.condition || action.condition(event))
                        .map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => action.handler(event)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: action.color,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (action.hoverColor) {
                                e.currentTarget.style.backgroundColor = action.hoverColor
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = action.color
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && onPageChange && onItemsPerPageChange && !loading && filteredEvents.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  )
}

export default EventsTable
