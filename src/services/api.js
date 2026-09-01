// Frontend-only configuration. No backend connectivity.
// This file intentionally contains no API URLs, fetch logic, or network calls.
// All data is served from local mock data via the service modules.

export const API_BASE_URL = '';
export const API_TIMEOUT = 0;

// Retained as an empty stub so any leftover references do not break the build.
export const API_ENDPOINTS = {};

// No auth token is used in the frontend-only build.
export function getAuthToken() {
  return null;
}

// Not used in the frontend-only build. Kept as a no-op stub.
export function buildUrl() {
  return '';
}

// Not used in the frontend-only build. Kept as a no-op stub that rejects,
// so any accidental call surfaces clearly instead of silently succeeding.
export async function apiRequest() {
  throw new Error('Backend connectivity has been removed. This app is frontend-only.');
}
