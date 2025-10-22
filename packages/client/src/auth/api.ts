import { getToken } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
  includeAuth?: boolean
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
  const { requireAuth = true, includeAuth = false, ...fetchOptions } = options
  
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Add auth token if required or if includeAuth is true
  if (requireAuth || includeAuth) {
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
export type UserRole = 'superadmin' | 'admin' | 'approver' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface PublicUserProfile {
  id: number
  name: string
  role: UserRole
  createdAt: string
}

export type EventStatus = 'draft' | 'pending_approval' | 'revision_requested' | 'published' | 'cancelled' | 'completed'

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
  status: EventStatus
  approvedBy?: number
  approverName?: string
  approvalDate?: string
  revisionComments?: string
  createdAt: string
  updatedAt: string
  // Registration information
  currentAttendees?: number
  isUserRegistered?: boolean
  userRegistrationStatus?: 'registered' | 'waitlisted' | 'cancelled'
  isFull?: boolean
  canRegister?: boolean
}

export interface CreateEventDto {
  title: string
  description?: string
  eventDate: string
  eventTime: string
  location: string
  maxAttendees?: number
  status?: EventStatus
}

export interface UpdateEventDto {
  title?: string
  description?: string
  eventDate?: string
  eventTime?: string
  location?: string
  maxAttendees?: number
  status?: EventStatus
}

export interface ApprovalDto {
  revisionComments?: string
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
          role: UserRole
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
        role: UserRole
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
        role: UserRole
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
    role: UserRole
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

  // Public user profile methods (no auth required)
  getPublicProfile: async (userId: number) => {
    return fetchApi<{
      success: boolean
      data: PublicUserProfile
    }>(`/users/${userId}/profile`, {
      requireAuth: false
    })
  },

  getUserCreatedEvents: async (userId: number) => {
    return fetchApi<{
      success: boolean
      data: Event[]
    }>(`/users/${userId}/events/created`, {
      requireAuth: false
    })
  },

  getUserJoinedEvents: async (userId: number) => {
    return fetchApi<{
      success: boolean
      data: Event[]
    }>(`/users/${userId}/events/joined`, {
      requireAuth: false
    })
  },
}

// Event API calls
export const eventApi = {
  // Get all published events (public access, but include auth if available)
  getEvents: async (page = 1, limit = 10, includeAuth = true) => {
    return fetchApi<PaginatedResponse<Event>>(
      `/events?page=${page}&limit=${limit}`,
      { requireAuth: false, includeAuth }
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

  // Get events pending approval
  getPendingApprovalEvents: async () => {
    return fetchApi<ApiResponse<Event[]>>('/events/pending')
  },

  // Submit event for approval
  submitForApproval: async (id: number) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}/submit-for-approval`, {
      method: 'POST',
    })
  },

  // Approve event
  approveEvent: async (id: number) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}/approve`, {
      method: 'POST',
    })
  },

  // Request revision
  requestRevision: async (id: number, revisionComments: string) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}/request-revision`, {
      method: 'POST',
      body: JSON.stringify({ revisionComments }),
    })
  },

  // Event Registration APIs

  // Join/register for an event
  joinEvent: async (id: number) => {
    return fetchApi<ApiResponse<{
      id: number
      eventId: number
      userId: number
      userName: string
      userEmail: string
      registrationDate: string
      status: 'registered' | 'waitlisted' | 'cancelled'
      createdAt: string
      updatedAt: string
    }>>(`/events/${id}/register`, {
      method: 'POST',
    })
  },

  // Leave/unregister from an event
  leaveEvent: async (id: number) => {
    return fetchApi<ApiResponse<null>>(`/events/${id}/register`, {
      method: 'DELETE',
    })
  },

  // Get user's joined events
  getJoinedEvents: async () => {
    return fetchApi<ApiResponse<{
      id: number
      eventId: number
      userId: number
      userName: string
      userEmail: string
      registrationDate: string
      status: 'registered' | 'waitlisted' | 'cancelled'
      createdAt: string
      updatedAt: string
    }[]>>('/events/joined')
  },

  // Get event registrations (for event creators/admins)
  getEventRegistrations: async (id: number) => {
    return fetchApi<ApiResponse<{
      id: number
      eventId: number
      userId: number
      userName: string
      userEmail: string
      registrationDate: string
      status: 'registered' | 'waitlisted' | 'cancelled'
      createdAt: string
      updatedAt: string
    }[]>>(`/events/${id}/registrations`)
  },

  // Get event registration statistics
  getEventStats: async (id: number) => {
    return fetchApi<ApiResponse<{
      totalRegistered: number
      totalWaitlisted: number
      totalCancelled: number
      maxAttendees?: number
      isFull: boolean
      canRegister: boolean
    }>>(`/events/${id}/stats`, {
      requireAuth: false
    })
  },

  // Get public attendee list for an event (names only)
  getEventAttendees: async (id: number) => {
    return fetchApi<ApiResponse<{
      id: number
      userId: number
      userName: string
      registrationDate: string
    }[]>>(`/events/${id}/attendees`, {
      requireAuth: false
    })
  },
}

// Location types
export interface Location {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Location API calls
export const locationApi = {
  // Get all locations
  getAll: async () => {
    return fetchApi<ApiResponse<Location[]>>('/locations', {
      requireAuth: false
    })
  },

  // Get only active locations (for dropdown)
  getActive: async () => {
    return fetchApi<ApiResponse<Location[]>>('/locations/active', {
      requireAuth: false
    })
  },

  // Get a specific location
  getById: async (id: number) => {
    return fetchApi<ApiResponse<Location>>(`/locations/${id}`, {
      requireAuth: false
    })
  },

  // Create a new location (admin only)
  create: async (data: { name: string }) => {
    return fetchApi<ApiResponse<Location>>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
      includeAuth: true
    })
  },

  // Update a location (admin only)
  update: async (id: number, data: { name?: string; isActive?: boolean }) => {
    return fetchApi<ApiResponse<Location>>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
      includeAuth: true
    })
  },

  // Toggle location status (admin only)
  toggleStatus: async (id: number) => {
    return fetchApi<ApiResponse<Location>>(`/locations/${id}/toggle`, {
      method: 'PATCH',
      requireAuth: true,
      includeAuth: true
    })
  },

  // Delete a location (admin only)
  delete: async (id: number) => {
    return fetchApi<{ success: boolean; message: string }>(`/locations/${id}`, {
      method: 'DELETE',
      requireAuth: true,
      includeAuth: true
    })
  }
}