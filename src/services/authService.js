// Authentication service — frontend-only demo implementation.
// Backend team: replace the function bodies with real API calls
// using apiRequest() from './api.js'. The function signatures
// and return shapes should stay the same so components don't change.

import { apiRequest, API_ENDPOINTS } from './api';
import { currentUser as defaultUser } from '../data/mockData';

const SESSION_KEY = 'ldi_session';

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default {
  async login(email, password) {
    // DEMO: accept any non-empty email/password.
    // Backend: replace with:
    //   return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
    //     method: 'POST',
    //     body: JSON.stringify({ email, password }),
    //   });
    const user = {
      ...defaultUser,
      email,
      token: 'demo-token',
      loginAt: new Date().toISOString(),
    };
    setSession(user);
    return user;
  },

  async signup(name, email, password) {
    // DEMO: create a local user.
    // Backend: replace with:
    //   return apiRequest(API_ENDPOINTS.AUTH.SIGNUP, {
    //     method: 'POST',
    //     body: JSON.stringify({ name, email, password }),
    //   });
    const user = {
      name,
      email,
      role: 'Legal Counsel',
      initials: name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      token: 'demo-token',
      loginAt: new Date().toISOString(),
    };
    setSession(user);
    return user;
  },

  async logout() {
    // DEMO: clear local session.
    // Backend: replace with:
    //   await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
    clearSession();
  },

  async forgotPassword(email) {
    // DEMO: simulate success.
    // Backend: replace with:
    //   return apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    //     method: 'POST',
    //     body: JSON.stringify({ email }),
    //   });
    return { success: true, email };
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};
