import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../auth/AuthContext'
import type { UpdateSettingsDto } from '../auth/api'

const SettingsPage = () => {
  const { user } = useAuth()
  const { settings, loading, error, updateSettings, uploadLogo, deleteLogo, refreshSettings } = useSettings()
  const [formData, setFormData] = useState<UpdateSettingsDto>({})
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        siteTitle: settings.siteTitle,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        backgroundColor: settings.backgroundColor,
        cardBackgroundColor: settings.cardBackgroundColor,
        textColorAuto: settings.textColorAuto,
        footerText: settings.footerText,
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        socialFacebook: settings.socialFacebook || '',
        socialTwitter: settings.socialTwitter || '',
        socialInstagram: settings.socialInstagram || '',
        socialLinkedin: settings.socialLinkedin || ''
      })
    }
  }, [settings])

  // Check if user is superadmin
  if (user?.role !== 'superadmin') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <h3>Access Denied</h3>
          <p>You must be a superadmin to access site settings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading settings...</div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <h3>Error Loading Settings</h3>
          <p>{error || 'Failed to load settings'}</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof UpdateSettingsDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    try {
      setSaving(true)
      setErrorMessage('')
      await uploadLogo(logoFile)
      setSuccessMessage('Logo uploaded successfully!')
      setLogoFile(null)
      setLogoPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload logo')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!confirm('Are you sure you want to delete the current logo?')) return

    try {
      setSaving(true)
      setErrorMessage('')
      await deleteLogo()
      setSuccessMessage('Logo deleted successfully!')
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete logo')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      // Save settings
      await updateSettings(formData)

      // Explicitly refresh from server to ensure form shows latest data
      await refreshSettings()

      // Show success message
      setSuccessMessage('Settings saved successfully!')

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#2c3e50', marginBottom: '24px' }}>
          Site Settings
        </h1>

        {successMessage && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            marginBottom: '20px'
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            marginBottom: '20px'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#2c3e50' }}>
              General Settings
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                Site Title
              </label>
              <input
                type="text"
                value={formData.siteTitle || ''}
                onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter site title"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                Site Logo
              </label>

              {settings.siteLogoUrl && (
                <div style={{ marginBottom: '12px' }}>
                  <img
                    src={`http://localhost:3000${settings.siteLogoUrl}`}
                    alt="Current Logo"
                    style={{ maxHeight: '80px', marginBottom: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={handleLogoDelete}
                    disabled={saving}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete Logo
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ marginBottom: '12px' }}
              />

              {logoPreview && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{ maxHeight: '80px', marginBottom: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={saving}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Upload Logo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Color Scheme */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#2c3e50' }}>
              Color Scheme
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Primary Color
                </label>
                <input
                  type="color"
                  value={formData.primaryColor || '#007bff'}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '12px', color: '#6c757d' }}>{formData.primaryColor || '#007bff'}</span>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={formData.secondaryColor || '#28a745'}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '12px', color: '#6c757d' }}>{formData.secondaryColor || '#28a745'}</span>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={formData.backgroundColor || '#f8f9fa'}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '12px', color: '#6c757d' }}>{formData.backgroundColor || '#f8f9fa'}</span>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Card Background Color
                </label>
                <input
                  type="color"
                  value={formData.cardBackgroundColor || '#ffffff'}
                  onChange={(e) => handleInputChange('cardBackgroundColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '12px', color: '#6c757d' }}>{formData.cardBackgroundColor || '#ffffff'}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.textColorAuto ?? false}
                  onChange={(e) => handleInputChange('textColorAuto', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: '500', color: '#2c3e50' }}>
                  Auto-calculate text colors based on background
                </span>
              </label>
            </div>
          </div>

          {/* Footer & Contact */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#2c3e50' }}>
              Footer & Contact Information
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                Footer Text
              </label>
              <textarea
                value={formData.footerText || ''}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="Enter footer text"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                Contact Address
              </label>
              <textarea
                value={formData.contactAddress || ''}
                onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="Enter contact address"
              />
            </div>
          </div>

          {/* Social Media */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#2c3e50' }}>
              Social Media Links
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.socialFacebook || ''}
                  onChange={(e) => handleInputChange('socialFacebook', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Twitter
                </label>
                <input
                  type="url"
                  value={formData.socialTwitter || ''}
                  onChange={(e) => handleInputChange('socialTwitter', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.socialInstagram || ''}
                  onChange={(e) => handleInputChange('socialInstagram', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' }}>
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.socialLinkedin || ''}
                  onChange={(e) => handleInputChange('socialLinkedin', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettingsPage
