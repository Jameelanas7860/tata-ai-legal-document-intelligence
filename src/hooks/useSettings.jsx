import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import settingsService, { DEFAULT_SETTINGS } from '../services/settingsService';
import { useTheme } from './useTheme';
import { useI18n } from './useI18n';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { setDarkMode } = useTheme();
  const { setLanguage } = useI18n();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
      setDarkMode(s.appearance.darkMode);
      setLanguage(s.appearance.language);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateNotifications = useCallback((updates) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
    settingsService.updateSection('notifications', updates);
  }, []);

  const updateAi = useCallback((updates) => {
    setSettings((prev) => ({
      ...prev,
      ai: { ...prev.ai, ...updates },
    }));
    settingsService.updateSection('ai', updates);
  }, []);

  const updateAppearance = useCallback((updates) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...updates },
    }));
    settingsService.updateSection('appearance', updates);
    if (updates.darkMode !== undefined) setDarkMode(updates.darkMode);
    if (updates.language) setLanguage(updates.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ settings, loaded, updateNotifications, updateAi, updateAppearance }),
    [settings, loaded, updateNotifications, updateAi, updateAppearance]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
