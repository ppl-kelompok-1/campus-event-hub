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
  const [validating, setValidating] = useState(true)
  const [tokenInvalid, setTokenInvalid] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      const urlToken = searchParams.get('token')

      if (!urlToken) {
        setError('Invalid reset link. No token found.')
        setValidating(false)
        return
      }

      setTokenState(urlToken)

      // Validate token with backend
      try {
        const response = await authApi.validateResetToken(urlToken)

        if (!response.data.valid) {
          setTokenInvalid(true)
        }
      } catch (err) {
        // If validation fails, mark as invalid
        setTokenInvalid(true)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
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
      // Mark token as invalid - this will trigger the dedicated error UI
      // We don't set the error state here because we'll show a dedicated error page instead
      setTokenInvalid(true)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while validating
  if (validating) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1>Reset Password</h1>
        <p>Validating reset link...</p>
      </div>
    )
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

  // If token is invalid after API call, show dedicated error state
  if (tokenInvalid) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1>Reset Password</h1>

        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            color: '#856404'
          }}>
            ⚠️ Invalid Token
          </h2>
          <p style={{ margin: 0, color: '#856404' }}>
            The reset link has expired or is no longer valid. Please request a new password reset.
          </p>
        </div>

        <button
          onClick={() => navigate('/forgot-password')}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '15px',
            fontSize: '16px',
            borderRadius: '4px'
          }}
        >
          Request New Reset Link
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#007bff', fontSize: '14px' }}>
            Back to Login
          </Link>
        </div>
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
