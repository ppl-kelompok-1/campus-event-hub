import { useAuth } from '../auth/AuthContext'

const Profile = () => {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>Profile Page</h1>
      {user && (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}
      <button onClick={logout} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  )
}

export default Profile