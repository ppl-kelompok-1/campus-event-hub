import { useState, useEffect } from 'react'
import { eventApi, API_BASE_URL } from '../auth/api'
import type { Event } from '../auth/api'
import EventsTable from '../components/EventsTable'
import type { EventsTableAction } from '../components/EventsTable'
import { useAuth } from '../auth/AuthContext'
import { getToken } from '../auth/storage'

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [isAuthenticated, currentPage, itemsPerPage])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await eventApi.getEvents(currentPage, itemsPerPage, isAuthenticated)
      setEvents(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalItems(response.pagination.total)
    } catch (err) {
      setError('Failed to load events. Please try again later.')
      console.error('Error fetching events:', err)
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

  const handleJoinEvent = async (event: Event) => {
    try {
      const response = await eventApi.joinEvent(event.id)
      
      // Update the event in the local state with new registration info
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === event.id 
            ? {
                ...e,
                isUserRegistered: true,
                userRegistrationStatus: response.data.status as 'registered' | 'waitlisted' | 'cancelled',
                currentAttendees: response.data.status === 'registered' 
                  ? (e.currentAttendees || 0) + 1 
                  : e.currentAttendees,
                isFull: e.maxAttendees ? ((e.currentAttendees || 0) + (response.data.status === 'registered' ? 1 : 0)) >= e.maxAttendees : false
              }
            : e
        )
      )

      // Show success message
      if (response.data.status === 'registered') {
        console.log('Successfully joined event:', event.title)
      } else if (response.data.status === 'waitlisted') {
        console.log('Added to waitlist for event:', event.title)
      }
    } catch (err) {
      console.error('Failed to join event:', err)
      setError('Failed to join event. Please try again.')
    }
  }

  const handleLeaveEvent = async (event: Event) => {
    try {
      await eventApi.leaveEvent(event.id)

      // Update the event in the local state
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === event.id
            ? {
                ...e,
                isUserRegistered: false,
                userRegistrationStatus: undefined,
                currentAttendees: e.userRegistrationStatus === 'registered'
                  ? Math.max((e.currentAttendees || 1) - 1, 0)
                  : e.currentAttendees,
                isFull: false // If user left, it's no longer full
              }
            : e
        )
      )

      console.log('Successfully left event:', event.title)
    } catch (err) {
      console.error('Failed to leave event:', err)
      setError('Failed to leave event. Please try again.')
    }
  }

  const handleCreateEvent = () => {
    window.location.href = '/events/create'
  }

  const exportToCSV = async () => {
    try {
      const token = getToken()
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`${API_BASE_URL}/events/export/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export CSV')
      }

      // Get the CSV content
      const csvContent = await response.text()

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'events.csv'
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition)
        if (matches && matches[1]) {
          filename = matches[1]
        }
      }

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  // Define table actions
  const tableActions: EventsTableAction[] = []

  if (isAuthenticated) {
    tableActions.push({
      type: 'register',
      label: 'Register',
      color: '#007bff',
      hoverColor: '#0056b3',
      condition: (event) => {
        const categoryAllowed = !event.allowedCategories ||
          event.allowedCategories.length === 0 ||
          (user ? event.allowedCategories.includes(user.category) : false)

        return !event.isUserRegistered &&
          !!event.canRegister &&
          !!event.hasRegistrationStarted &&
          !event.isFull &&
          categoryAllowed
      },
      handler: handleJoinEvent
    })

    tableActions.push({
      type: 'leave',
      label: 'Leave',
      color: '#dc3545',
      condition: (event) => event.isUserRegistered === true,
      handler: handleLeaveEvent
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '24px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            margin: '0 0 8px 0',
            color: '#2c3e50',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            Events
          </h1>
          <p style={{
            margin: '0',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Discover and join exciting events happening on campus
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Action Buttons Row - When events exist */}
        {isAuthenticated && events.length > 0 && (
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Create Event Button - Left */}
            <button
              onClick={handleCreateEvent}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff'
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              ➕ Create Event
            </button>

            {/* Export CSV Button - Right */}
            <button
              onClick={exportToCSV}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#218838'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745'
              }}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              📥 Export to CSV
            </button>
          </div>
        )}

        {/* Create Event Button Only - When no events */}
        {isAuthenticated && events.length === 0 && (
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <button
              onClick={handleCreateEvent}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff'
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              ➕ Create Event
            </button>
          </div>
        )}

        <EventsTable
          events={events}
          loading={loading}
          error={error}
          showStatusFilters={true}
          statusFilterOptions={['all', 'published', 'cancelled']}
          showDateFilters={true}
          showSearch={true}
          actions={tableActions}
          emptyMessage="No Events Found"
          emptyDescription="There are no published events at the moment. Check back later!"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage
          }}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  )
}

export default EventsPage