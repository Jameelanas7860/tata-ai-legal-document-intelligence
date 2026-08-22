// Centralized API configuration.
// Backend team: set VITE_API_BASE_URL in your .env file to point to the real API.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_TIMEOUT = 30000;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    DETAIL: '/documents/:id',
  },
  PROCESSING: {
    STATUS: '/documents/:id/status',
  },
  RISKS: {
    ANALYSIS: '/documents/:id/risks',
  },
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
  },
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
  AUDIT: {
    LIST: '/audit',
    EXPORT: '/audit/export',
  },
};

export function getAuthToken() {
  try {
    const session = JSON.parse(localStorage.getItem('ldi_session') || 'null');
    return session?.token || null;
  } catch {
    return null;
  }
}

export function buildUrl(path, params = {}) {
  let url = `${API_BASE_URL}${path}`;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  });
  return url;
}

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL not configured. Set VITE_API_BASE_URL in .env');
  }

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(buildUrl(path, options.params), {
    ...options,
    headers,
    signal: options.signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}
