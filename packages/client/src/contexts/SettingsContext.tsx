import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { settingsApi } from '../auth/api'
import type { SiteSettings, UpdateSettingsDto } from '../auth/api'

interface SettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  error: string | null
  updateSettings: (data: UpdateSettingsDto) => Promise<void>
  uploadLogo: (file: File) => Promise<void>
  deleteLogo: () => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings on mount
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await settingsApi.getSettings()
      setSettings(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load settings')
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Apply theme to document root
  useEffect(() => {
    if (settings) {
      const root = document.documentElement

      // Apply colors as CSS variables
      root.style.setProperty('--color-primary', settings.primaryColor)
      root.style.setProperty('--color-secondary', settings.secondaryColor)
      root.style.setProperty('--color-background', settings.backgroundColor)
      root.style.setProperty('--color-card-background', settings.cardBackgroundColor)
      root.style.setProperty('--color-text-primary', settings.textColorPrimary)
      root.style.setProperty('--color-text-secondary', settings.textColorSecondary)
      root.style.setProperty('--color-text-muted', settings.textColorMuted)

      // Update document background color
      document.body.style.backgroundColor = settings.backgroundColor
    }
  }, [settings])

  const updateSettings = async (data: UpdateSettingsDto) => {
    try {
      setError(null)
      const response = await settingsApi.updateSettings(data)
      setSettings(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
      throw err
    }
  }

  const uploadLogo = async (file: File) => {
    try {
      setError(null)
      const response = await settingsApi.uploadLogo(file)
      setSettings(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
      throw err
    }
  }

  const deleteLogo = async () => {
    try {
      setError(null)
      await settingsApi.deleteLogo()
      await fetchSettings() // Refresh to get updated settings
    } catch (err: any) {
      setError(err.message || 'Failed to delete logo')
      throw err
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    uploadLogo,
    deleteLogo,
    refreshSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
