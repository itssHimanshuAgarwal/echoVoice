import { useState, useCallback, useEffect } from 'react';

export interface PhraseHistoryItem {
  id: string;
  phrase: string;
  timestamp: Date;
  emotion?: string;
  location?: string;
  person?: string;
  phraseType?: string;
}

const HISTORY_STORAGE_KEY = 'phrase_history';
const MAX_HISTORY_ITEMS = 10;

export const usePhraseHistory = () => {
  const [history, setHistory] = useState<PhraseHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Error loading phrase history:', error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveToStorage = useCallback((newHistory: PhraseHistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving phrase history:', error);
    }
  }, []);

  const addToHistory = useCallback((
    phrase: string,
    emotion?: string,
    location?: string,
    person?: string,
    phraseType?: string
  ) => {
    const newItem: PhraseHistoryItem = {
      id: Date.now().toString(),
      phrase,
      timestamp: new Date(),
      emotion,
      location,
      person,
      phraseType
    };

    setHistory(prevHistory => {
      // Add new item at the beginning and limit to MAX_HISTORY_ITEMS
      const newHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(newHistory);
      return newHistory;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const removeItem = useCallback((id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      saveToStorage(newHistory);
      return newHistory;
    });
  }, [saveToStorage]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeItem
  };
};