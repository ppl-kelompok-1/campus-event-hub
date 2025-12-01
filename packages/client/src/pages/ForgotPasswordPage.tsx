import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../auth/api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Forgot Password</h1>

      {success ? (
        <div>
          <div style={{ color: 'green', marginBottom: '15px' }}>
            If this email exists in our system, a password reset link has been sent.
          </div>
          <Link to="/login" style={{ color: '#007bff' }}>
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

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
              placeholder="your.email@example.com"
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#007bff', fontSize: '14px' }}>
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default ForgotPasswordPage
