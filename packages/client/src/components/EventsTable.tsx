import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Event, EventStatus } from '../auth/api'

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
}

const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading = false,
  error = '',
  showStatusFilters = false,
  statusFilterOptions = ['all', 'draft', 'pending_approval', 'revision_requested', 'published', 'cancelled', 'completed'],
  showDateFilters = false,
  showSearch = true,
  actions = [],
  emptyMessage = 'No Events Found',
  emptyDescription = 'There are no events to display.'
}) => {
  const navigate = useNavigate()
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter events whenever filters change
  useEffect(() => {
    filterEvents()
  }, [events, statusFilter, dateFilter, searchQuery])

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

    // Search filter
    if (showSearch && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.creatorName.toLowerCase().includes(query) ||
        event.locationName.toLowerCase().includes(query)
      )
    }

    setFilteredEvents(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; text: string; icon: string }> = {
      draft: { bg: '#e9ecef', color: '#495057', text: 'Draft', icon: '📝' },
      pending_approval: { bg: '#fff3cd', color: '#856404', text: 'Pending', icon: '🟡' },
      revision_requested: { bg: '#ffe5cc', color: '#cc6600', text: 'Revision', icon: '🟠' },
      published: { bg: '#d4edda', color: '#155724', text: 'Published', icon: '✅' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelled', icon: '❌' },
      completed: { bg: '#cce5ff', color: '#004085', text: 'Completed', icon: '🏁' }
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
      cancelled: 'Cancelled',
      completed: 'Completed'
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

        {/* Search Bar */}
        {showSearch && (
          <div>
            <input
              type="text"
              placeholder="Search by title, creator, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

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
    </div>
  )
}

export default EventsTable
