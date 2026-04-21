import { useAuthStore } from '@stores';
import { useNotificationStore } from '@stores';

// The base URL comes from environment or defaults to the proxy
const API_BASE = import.meta.env.VITE_API_URL || '';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  skipErrorToast?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { requireAuth = true, skipErrorToast = false, ...customConfig } = options;
  
  // Always use /v1 prefix for all calls
  const url = `${API_BASE}${path.startsWith('/v1') ? path : `/v1${path.startsWith('/') ? path : `/${path}`}`}`;
  
  const headers = new Headers(customConfig.headers || {});
  
  // Set default content type if not provided and has body
  if (customConfig.body && !headers.has('Content-Type') && typeof customConfig.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token if required
  if (requireAuth) {
    const session = useAuthStore.getState().session;
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - Token Refresh Logic
    if (response.status === 401 && requireAuth) {
      const authStore = useAuthStore.getState();
      const session = authStore.session;
      
      if (session?.refresh_token && !url.includes('/auth/refresh')) {
        try {
          // Attempt refresh
          const refreshRes = await fetch(`${API_BASE}/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: session.refresh_token })
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            authStore.setSession(data.tokens);
            
            // Retry original request with new token
            headers.set('Authorization', `Bearer ${data.tokens.access_token}`);
            const retryRes = await fetch(url, { ...config, headers });
            return handleResponse(retryRes, skipErrorToast);
          } else {
            // Refresh failed, logout
            authStore.logout();
            throw new ApiError(401, 'Session expired. Please log in again.');
          }
        } catch (e) {
          authStore.logout();
          throw new ApiError(401, 'Session expired. Please log in again.');
        }
      } else {
        authStore.logout();
      }
    }

    return handleResponse<T>(response, skipErrorToast);
  } catch (error) {
    if (!skipErrorToast && error instanceof ApiError) {
      useNotificationStore.getState().error('Request Failed', error.message);
    } else if (!skipErrorToast && error instanceof Error) {
       useNotificationStore.getState().error('Network Error', 'Please check your connection and try again.');
    }
    throw error;
  }
}

async function handleResponse<T>(response: Response, skipErrorToast: boolean): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    
    // Parse FastAPI 422 Validation Error
    if (response.status === 422 && data?.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err: any) => `${err.loc?.join('.') || 'field'}: ${err.msg}`).join(', ');
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      }
    } else if (data?.detail) {
       errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } else if (data?.message) {
       errorMessage = data.message;
    } else if (data?.error?.message) {
       errorMessage = data.error.message;
    }
    
    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(path, { ...options, method: 'GET' }),
    
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) => 
    request<T>(path, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) => 
    request<T>(path, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) => 
    request<T>(path, { 
      ...options, 
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(path, { ...options, method: 'DELETE' }),
};
