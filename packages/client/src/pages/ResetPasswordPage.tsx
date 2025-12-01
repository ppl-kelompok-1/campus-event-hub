import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authApi } from '../auth/api'
import { setToken, setUser } from '../auth/storage'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [token, setTokenState] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Extract token from URL on component mount
    const urlToken = searchParams.get('token')
    if (!urlToken) {
      setError('Invalid reset link. No token found.')
    } else {
      setTokenState(urlToken)
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!token) {
      setError('Invalid reset link. No token found.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.resetPassword(token, newPassword)

      // Auto-login: Store token and user data
      setToken(response.data.token)
      setUser(response.data.user)

      // Redirect to home
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  // If no token in URL, show error state
  if (!token && error) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1>Reset Password</h1>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
        <Link to="/forgot-password" style={{ color: '#007bff' }}>
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Reset Password</h1>

      <form onSubmit={handleSubmit}>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Enter your new password below.
        </p>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px' }}>
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '8px' }}
            placeholder="At least 8 characters"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Re-enter your password"
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: '15px'
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#007bff', fontSize: '14px' }}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ResetPasswordPage
