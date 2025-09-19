import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../auth/api'

const Profile = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleEdit = () => {
    setIsEditing(true)
    setName(user?.name || '')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setName(user?.name || '')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate passwords match
    if (password && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Only send fields that have been changed
      const updateData: any = {}
      if (name && name !== user?.name) {
        updateData.name = name
      }
      if (password) {
        updateData.password = password
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        await authApi.updateProfile(updateData.name, updateData.password)
        setSuccess('Profile updated successfully')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setIsEditing(false)
          setSuccess('')
        }, 2000)
      } else {
        setError('No changes to update')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Email (cannot be changed)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ width: '100%', padding: '12px', backgroundColor: '#f8f9fa', color: '#6c757d', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Role (cannot be changed)
            </label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              style={{ width: '100%', padding: '12px', backgroundColor: '#f8f9fa', color: '#6c757d', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
              New Password (leave empty to keep current)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {success && (
            <div className="success">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Profile</h1>
        <button onClick={handleEdit}>
          Edit Profile
        </button>
      </div>
      
      {user && (
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Name</label>
            <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>{user.name}</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
            <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>{user.email}</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Role</label>
            <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <span style={{ 
                backgroundColor: user.role === 'superadmin' ? '#007bff' : user.role === 'admin' ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '3px',
                fontSize: '0.9rem',
                textTransform: 'capitalize'
              }}>
                {user.role}
              </span>
            </p>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={logout} className="danger">
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile