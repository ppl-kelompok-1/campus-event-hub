import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { userApi, type UserCategory } from '../auth/api'
import CategoryDropdown from '../components/CategoryDropdown'

const EditUserPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [category, setCategory] = useState<UserCategory>('mahasiswa')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Check permissions
  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    navigate('/')
    return null
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await userApi.getUserById(parseInt(id))
      setName(response.data.name)
      setEmail(response.data.email)
      setRole(response.data.role)
      setCategory(response.data.category)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    setError('')
    setSaving(true)

    try {
      const updateData: any = {
        name,
        email,
        role,
        category,
      }

      // Only include password if it's been changed
      if (password) {
        updateData.password = password
      }

      await userApi.updateUser(parseInt(id), updateData)
      navigate('/users')
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Edit User</h1>
      <form onSubmit={handleSubmit}>
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
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password (leave empty to keep current)
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '5px' }}>
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            disabled={user?.role === 'admin' && role === 'superadmin'}
          >
            <option value="user">User</option>
            {user?.role === 'superadmin' && <option value="admin">Admin</option>}
            {user?.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <CategoryDropdown
            value={category}
            onChange={setCategory}
            required={true}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/users')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditUserPage