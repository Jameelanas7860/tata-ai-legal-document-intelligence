// Settings service — real Supabase database queries.

import { supabase } from '../lib/supabase';
import authService from './authService';

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

export default {
  async getSettings() {
    const user = authService.getSessionUser();
    if (!user) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return DEFAULT_SETTINGS;

    return {
      notifications: {
        emailAlerts: data.email_alerts,
        riskEscalations: data.risk_escalation_alerts,
        weeklyDigest: data.weekly_digest,
      },
      ai: {
        autoAnalysis: data.auto_analysis,
        riskThreshold: data.risk_threshold,
      },
      appearance: {
        darkMode: data.dark_mode,
        language: data.language,
      },
    };
  },

  async updateSettings(updates) {
    const user = authService.getSessionUser();
    if (!user) throw new Error('Not authenticated');

    const dbUpdates = {};
    if (updates.notifications) {
      if (updates.notifications.emailAlerts !== undefined) dbUpdates.email_alerts = updates.notifications.emailAlerts;
      if (updates.notifications.riskEscalations !== undefined) dbUpdates.risk_escalation_alerts = updates.notifications.riskEscalations;
      if (updates.notifications.weeklyDigest !== undefined) dbUpdates.weekly_digest = updates.notifications.weeklyDigest;
    }
    if (updates.ai) {
      if (updates.ai.autoAnalysis !== undefined) dbUpdates.auto_analysis = updates.ai.autoAnalysis;
      if (updates.ai.riskThreshold) dbUpdates.risk_threshold = updates.ai.riskThreshold;
    }
    if (updates.appearance) {
      if (updates.appearance.darkMode !== undefined) dbUpdates.dark_mode = updates.appearance.darkMode;
      if (updates.appearance.language) dbUpdates.language = updates.appearance.language;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...dbUpdates })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      notifications: {
        emailAlerts: data.email_alerts,
        riskEscalations: data.risk_escalation_alerts,
        weeklyDigest: data.weekly_digest,
      },
      ai: {
        autoAnalysis: data.auto_analysis,
        riskThreshold: data.risk_threshold,
      },
      appearance: {
        darkMode: data.dark_mode,
        language: data.language,
      },
    };
  },

  async updateSection(section, updates) {
    const current = await this.getSettings();
    return this.updateSettings({ [section]: { ...current[section], ...updates } });
  },

  getLocal() {
    try {
      const raw = localStorage.getItem('ldi_settings');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
