// Settings service — frontend-only demo implementation.
// Backend team: replace with real API calls using apiRequest().

import { apiRequest, API_ENDPOINTS } from './api';

const SETTINGS_KEY = 'ldi_settings';

export const DEFAULT_SETTINGS = {
  notifications: {
    emailAlerts: true,
    riskEscalations: true,
    weeklyDigest: false,
  },
  ai: {
    autoAnalysis: true,
    riskThreshold: 'Medium',
  },
  appearance: {
    darkMode: false,
    language: 'English',
  },
};

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default {
  async getSettings() {
    // Backend: return apiRequest(API_ENDPOINTS.SETTINGS.GET);
    const stored = readSettings();
    return {
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(stored?.notifications || {}) },
      ai: { ...DEFAULT_SETTINGS.ai, ...(stored?.ai || {}) },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...(stored?.appearance || {}) },
    };
  },

  async updateSettings(updates) {
    // Backend: return apiRequest(API_ENDPOINTS.SETTINGS.UPDATE, {
    //   method: 'PUT',
    //   body: JSON.stringify(updates),
    // });
    const current = await this.getSettings();
    const next = {
      notifications: { ...current.notifications, ...(updates.notifications || {}) },
      ai: { ...current.ai, ...(updates.ai || {}) },
      appearance: { ...current.appearance, ...(updates.appearance || {}) },
    };
    writeSettings(next);
    return next;
  },

  async updateSection(section, updates) {
    const current = await this.getSettings();
    return this.updateSettings({ [section]: { ...current[section], ...updates } });
  },

  getLocal() {
    return readSettings();
  },
};
