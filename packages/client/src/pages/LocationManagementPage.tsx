import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { locationApi, type Location } from '../auth/api'

const LocationManagementPage = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      navigate('/')
      return
    }
  }, [isAuthenticated, user, navigate])

  // Load locations on mount
  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await locationApi.getAll()
      setLocations(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations')
      console.error('Error loading locations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (location?: Location) => {
    setEditingLocation(location || null)
    setFormData({ name: location?.name || '' })
    setIsModalOpen(true)
    setError('')
    setSuccess('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLocation(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Location name is required')
      return
    }

    try {
      if (editingLocation) {
        await locationApi.update(editingLocation.id, { name: formData.name })
        setSuccess('Location updated successfully')
      } else {
        await locationApi.create({ name: formData.name })
        setSuccess('Location created successfully')
      }
      handleCloseModal()
      await loadLocations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location')
      console.error('Error saving location:', err)
    }
  }

  const handleToggleStatus = async (location: Location) => {
    try {
      setError('')
      setSuccess('')
      await locationApi.toggleStatus(location.id)
      setSuccess(`Location ${location.isActive ? 'deactivated' : 'activated'} successfully`)
      await loadLocations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle location status')
      console.error('Error toggling status:', err)
    }
  }

  const handleDelete = async (location: Location) => {
    if (!confirm(`Are you sure you want to delete "${location.name}"?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await locationApi.delete(location.id)
      setSuccess('Location deleted successfully')
      await loadLocations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location')
      console.error('Error deleting location:', err)
    }
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return null
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Location Management</h1>
        <p style={{ margin: '0', color: '#6c757d' }}>Manage campus event venues</p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      {/* Add Location Button */}
      <button
        onClick={() => handleOpenModal()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      >
        + Add New Location
      </button>

      {/* Locations Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          Loading locations...
        </div>
      ) : locations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          No locations found. Create your first location!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            border: '1px solid #dee2e6'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#495057' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(location => (
                <tr key={location.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>{location.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: location.isActive ? '#d4edda' : '#f8d7da',
                      color: location.isActive ? '#155724' : '#721c24'
                    }}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#6c757d', fontSize: '14px' }}>
                    {new Date(location.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenModal(location)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: '#17a2b8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(location)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: location.isActive ? '#ffc107' : '#28a745',
                        color: location.isActive ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {location.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(location)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter location name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationManagementPage
