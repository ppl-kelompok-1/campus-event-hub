import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { userApi } from '../auth/api'
import type { User } from '../auth/api'

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Only admin and superadmin can view users
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      navigate('/')
      return
    }

    fetchUsers()
  }, [currentPage, user, navigate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getUsers(currentPage)
      setUsers(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await userApi.deleteUser(id)
      await fetchUsers() // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to delete user')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>Users Management</h1>
      
      <Link to="/users/create">
        <button style={{ marginBottom: '20px' }}>Create New User</button>
      </Link>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <Link to={`/users/edit/${user.id}`}>
                  <button style={{ marginRight: '5px' }}>Edit</button>
                </Link>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: '0 20px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default UsersPage