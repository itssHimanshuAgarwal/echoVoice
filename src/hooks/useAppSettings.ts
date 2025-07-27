import { useState, useCallback, useEffect } from 'react';

export interface AppSettings {
  emotionDetection: boolean;
  locationDetection: boolean;
  phraseTone: 'formal' | 'friendly' | 'neutral';
}

const DEFAULT_SETTINGS: AppSettings = {
  emotionDetection: true,
  locationDetection: true,
  phraseTone: 'friendly',
};

const SETTINGS_STORAGE_KEY = 'app_settings';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveToStorage = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, ...updates };
      saveToStorage(newSettings);
      return newSettings;
    });
  }, [saveToStorage]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveToStorage(DEFAULT_SETTINGS);
  }, [saveToStorage]);

  const getTonePromptModifier = useCallback(() => {
    switch (settings.phraseTone) {
      case 'formal':
        return 'Use professional, polite, and respectful language. Keep phrases formal and courteous.';
      case 'friendly':
        return 'Use casual, warm, and friendly language. Make phrases approachable and conversational.';
      case 'neutral':
        return 'Use clear, direct, and neutral language. Keep phrases simple and straightforward.';
      default:
        return 'Use clear and natural language.';
    }
  }, [settings.phraseTone]);

  return {
    settings,
    updateSettings,
    resetSettings,
    getTonePromptModifier,
  };
};