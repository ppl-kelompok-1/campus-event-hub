import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { userApi } from '../auth/api'
import type { PublicUserProfile, Event } from '../auth/api'
import EventsTable from '../components/EventsTable'

const PublicUserProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid user ID')
      setLoading(false)
      return
    }

    fetchUserProfile()
  }, [id])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const userId = Number(id)

      // Fetch user profile
      const profileResponse = await userApi.getPublicProfile(userId)
      setProfile(profileResponse.data)

      // Fetch created events
      const createdResponse = await userApi.getUserCreatedEvents(userId)
      setCreatedEvents(createdResponse.data)

      // Fetch joined events
      const joinedResponse = await userApi.getUserJoinedEvents(userId)
      setJoinedEvents(joinedResponse.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile')
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return '#007bff'
      case 'admin': return '#28a745'
      case 'approver': return '#ffc107'
      default: return '#6c757d'
    }
  }

  const getRoleTextColor = (role: string) => {
    return role === 'approver' ? '#212529' : 'white'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading user profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>User Not Found</h3>
          <p style={{ margin: '0 0 20px 0' }}>
            {error || 'The user profile you are looking for does not exist.'}
          </p>
          <Link
            to="/"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '24px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {/* Back Button */}
          <div style={{ marginBottom: '20px' }}>
            <Link
              to="/"
              style={{
                color: '#007bff',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Back to Events
            </Link>
          </div>

          <div style={{
            marginBottom: '20px'
          }}>
            <h1 style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '32px',
              fontWeight: '700'
            }}>
              User Profile
            </h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            {/* Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                color: '#2c3e50'
              }}>
                {profile.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '8px'
              }}>
                <span style={{
                  backgroundColor: getRoleBadgeColor(profile.role),
                  color: getRoleTextColor(profile.role),
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {profile.role}
                </span>
                <span style={{
                  color: '#6c757d',
                  fontSize: '14px'
                }}>
                  Member since {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2c3e50'
                }}>
                  {createdEvents.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  Created
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2c3e50'
                }}>
                  {joinedEvents.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  Joined
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '8px',
          border: '1px solid #e9ecef'
        }}>
          <button
            onClick={() => setActiveTab('created')}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'created' ? '#007bff' : 'transparent',
              color: activeTab === 'created' ? 'white' : '#6c757d',
              transition: 'all 0.2s'
            }}
          >
            📋 Created Events ({createdEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'joined' ? '#007bff' : 'transparent',
              color: activeTab === 'joined' ? 'white' : '#6c757d',
              transition: 'all 0.2s'
            }}
          >
            🎫 Joined Events ({joinedEvents.length})
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'created' && (
            <EventsTable
              events={createdEvents}
              loading={false}
              showStatusFilters={true}
              statusFilterOptions={['all', 'draft', 'pending_approval', 'revision_requested', 'published', 'cancelled']}
              showDateFilters={true}
              showSearch={true}
              actions={[]}
              emptyMessage="No Created Events"
              emptyDescription={`${profile.name} hasn't created any events yet.`}
            />
          )}

          {activeTab === 'joined' && (
            <EventsTable
              events={joinedEvents}
              loading={false}
              showStatusFilters={false}
              showDateFilters={true}
              showSearch={true}
              actions={[]}
              emptyMessage="No Joined Events"
              emptyDescription={`${profile.name} hasn't joined any events yet.`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicUserProfilePage
