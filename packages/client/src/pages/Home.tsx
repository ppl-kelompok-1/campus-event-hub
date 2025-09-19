import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Campus Event Hub</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
        Your central platform for managing campus events and activities
      </p>
      
      {isAuthenticated ? (
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <p style={{ marginBottom: '30px' }}>
            Use the navigation above to access your profile or manage the platform.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '30px' }}>Please login to access the platform</p>
          <Link to="/login">
            <button style={{ 
              padding: '15px 30px', 
              fontSize: '1.1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Login to Your Account
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Home