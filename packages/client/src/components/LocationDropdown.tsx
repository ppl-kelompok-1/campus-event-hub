import { useState, useEffect } from 'react'
import { locationApi } from '../auth/api'
import type { Location } from '../auth/api'

interface LocationDropdownProps {
  value: string | number
  onChange: (locationId: number, locationName: string) => void
  disabled?: boolean
  label?: string
  required?: boolean
  error?: string
}

export function LocationDropdown({
  value,
  onChange,
  disabled = false,
  label = 'Location',
  required = true,
  error
}: LocationDropdownProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true)
        setLoadError(null)
        const response = await locationApi.getActive()
        setLocations(response.data)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load locations')
        console.error('Error loading locations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value)
    const selectedLocation = locations.find(loc => loc.id === selectedId)
    if (selectedLocation) {
      onChange(selectedId, selectedLocation.name)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </label>

      {loadError && (
        <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          {loadError}
        </div>
      )}

      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: error ? '2px solid #d32f2f' : '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '1rem',
          backgroundColor: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <option value="">
          {loading ? 'Loading locations...' : 'Select a location'}
        </option>
        {locations.map(location => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>

      {error && (
        <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
