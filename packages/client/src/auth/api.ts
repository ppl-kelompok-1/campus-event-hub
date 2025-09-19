import { getToken } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

export class ApiError extends Error {
  status: number
  
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// Generic fetch wrapper with authentication
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options
  
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Add auth token if required
  if (requireAuth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  // Merge with any headers from fetchOptions
  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers)
  }
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || data.message || 'An error occurred'
      )
    }
    
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new Error('Network error')
  }
}

// Types
export interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export interface Event {
  id: number
  title: string
  description?: string
  eventDate: string
  eventTime: string
  location: string
  maxAttendees?: number
  createdBy: number
  creatorName: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface CreateEventDto {
  title: string
  description?: string
  eventDate: string
  eventTime: string
  location: string
  maxAttendees?: number
  status?: 'draft' | 'published'
}

export interface UpdateEventDto {
  title?: string
  description?: string
  eventDate?: string
  eventTime?: string
  location?: string
  maxAttendees?: number
  status?: 'draft' | 'published' | 'cancelled' | 'completed'
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    totalPages: number
    limit: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi<{
      success: boolean
      data: {
        user: {
          id: number
          name: string
          email: string
          role: string
        }
        token: string
      }
      message: string
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    })
  },
  
  getProfile: async () => {
    return fetchApi<{
      success: boolean
      data: {
        id: number
        name: string
        email: string
        role: string
      }
    }>('/auth/profile')
  },
  
  updateProfile: async (name?: string, password?: string) => {
    return fetchApi<{
      success: boolean
      data: {
        id: number
        name: string
        email: string
        role: string
      }
      message: string
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, password }),
    })
  },
}

// User management API calls
export const userApi = {
  getUsers: async (page = 1, limit = 10) => {
    return fetchApi<PaginatedResponse<User>>(
      `/users?page=${page}&limit=${limit}`
    )
  },
  
  getUserById: async (id: number) => {
    return fetchApi<{
      success: boolean
      data: User
    }>(`/users/${id}`)
  },
  
  createUser: async (userData: {
    name: string
    email: string
    password: string
    role: string
  }) => {
    return fetchApi<{
      success: boolean
      data: User
      message: string
    }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },
  
  updateUser: async (
    id: number,
    userData: {
      name?: string
      email?: string
      password?: string
      role?: string
    }
  ) => {
    return fetchApi<{
      success: boolean
      data: User
      message: string
    }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },
  
  deleteUser: async (id: number) => {
    return fetchApi<{
      success: boolean
      message: string
    }>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}

// Event API calls
export const eventApi = {
  // Get all published events (public access)
  getEvents: async (page = 1, limit = 10) => {
    return fetchApi<PaginatedResponse<Event>>(
      `/events?page=${page}&limit=${limit}`,
      { requireAuth: false }
    )
  },

  // Get current user's events
  getMyEvents: async () => {
    return fetchApi<ApiResponse<Event[]>>('/events/my')
  },

  // Get event by ID
  getEventById: async (id: number) => {
    return fetchApi<ApiResponse<Event>>(
      `/events/${id}`,
      { requireAuth: false }
    )
  },

  // Create new event
  createEvent: async (eventData: CreateEventDto) => {
    return fetchApi<ApiResponse<Event>>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  },

  // Update event
  updateEvent: async (id: number, eventData: UpdateEventDto) => {
    return fetchApi<ApiResponse<Event>>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  },

  // Delete event
  deleteEvent: async (id: number) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}`, {
      method: 'DELETE',
    })
  },

  // Publish event
  publishEvent: async (id: number) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}/publish`, {
      method: 'POST',
    })
  },

  // Cancel event
  cancelEvent: async (id: number) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}/cancel`, {
      method: 'POST',
    })
  },
}