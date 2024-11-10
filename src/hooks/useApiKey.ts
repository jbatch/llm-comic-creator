// src/hooks/useApiKey.ts
import { useState, useCallback, useEffect } from "react";

const LOCAL_STORAGE_KEY = "openai-api-key";

export const useApiKey = () => {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    // Initialize from localStorage on mount
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  });

  const getApiKey = useCallback((): string | null => {
    return apiKey;
  }, [apiKey]);

  const setApiKey = useCallback((key: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEY, key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback((): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setApiKeyState(null);
  }, []);

  const hasApiKey = useCallback((): boolean => {
    return !!apiKey;
  }, [apiKey]);

  // Sync with localStorage changes (e.g., from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        setApiKeyState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    getApiKey,
    setApiKey,
    clearApiKey,
    hasApiKey,
  };
};
