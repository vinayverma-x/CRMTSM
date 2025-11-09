// API client helper for making authenticated requests
// This automatically includes the JWT token in requests

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // Set up headers
  const headers = new Headers(options.headers || {})
  
  // Only set Content-Type if there's a body and it's not already set
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  
  // Add Authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Make request with token
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear auth and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      window.location.href = '/'
    }
  }

  return response
}

// Helper for GET requests
export async function apiGet(url: string, options: RequestInit = {}) {
  return apiRequest(url, { ...options, method: 'GET' })
}

// Helper for POST requests
export async function apiPost(url: string, data: any, options: RequestInit = {}) {
  return apiRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Helper for PUT requests
export async function apiPut(url: string, data: any, options: RequestInit = {}) {
  return apiRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Helper for DELETE requests
export async function apiDelete(url: string, options: RequestInit = {}) {
  return apiRequest(url, { ...options, method: 'DELETE' })
}

