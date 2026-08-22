// Profile service — frontend-only demo implementation.
// Backend team: replace with real API calls using apiRequest().

import { apiRequest, API_ENDPOINTS } from './api';
import { currentUser as defaultUser } from '../data/mockData';

const PROFILE_KEY = 'ldi_profile';

function readProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export default {
  async getProfile() {
    // Backend: return apiRequest(API_ENDPOINTS.PROFILE.GET);
    const stored = readProfile();
    const session = JSON.parse(localStorage.getItem('ldi_session') || 'null');
    return {
      ...defaultUser,
      email: 'anas.khan@tata.com',
      organization: 'Tata Group',
      memberSince: 'January 2026',
      ...stored,
      ...session ? { name: session.name || defaultUser.name, email: session.email || 'anas.khan@tata.com' } : {},
    };
  },

  async updateProfile(updates) {
    // Backend: return apiRequest(API_ENDPOINTS.PROFILE.UPDATE, {
    //   method: 'PUT',
    //   body: JSON.stringify(updates),
    // });
    const current = readProfile() || {};
    const next = { ...current, ...updates };
    writeProfile(next);

    const sessionRaw = localStorage.getItem('ldi_session');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      const updated = { ...session, ...updates };
      localStorage.setItem('ldi_session', JSON.stringify(updated));
    }

    return next;
  },
};
