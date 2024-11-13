// src/hooks/useApiKey.ts
import { useState, useCallback } from "react";

const OPEN_AI_LOCAL_STORAGE_KEY = "openai-api-key";
const LEONARDO_LOCAL_STORAGE_KEY = "leonardo-api-key";

export interface ApiKeys {
  openAi: string | null;
  leonardo: string | null;
}

export const useApiKey = () => {
  const [apiKeys, setApiKeyState] = useState<ApiKeys | null>(() => {
    // Initialize from localStorage on mount
    return {
      openAi: localStorage.getItem(OPEN_AI_LOCAL_STORAGE_KEY),
      leonardo: localStorage.getItem(LEONARDO_LOCAL_STORAGE_KEY),
    };
  });

  const getApiKeys = useCallback((): ApiKeys | null => {
    return apiKeys;
  }, [apiKeys]);

  const setApiKeys = useCallback((keys: ApiKeys): void => {
    localStorage.setItem(OPEN_AI_LOCAL_STORAGE_KEY, keys.openAi!);
    localStorage.setItem(LEONARDO_LOCAL_STORAGE_KEY, keys.leonardo!);
    setApiKeyState(keys);
  }, []);

  const clearApiKeys = useCallback((): void => {
    localStorage.removeItem(OPEN_AI_LOCAL_STORAGE_KEY);
    localStorage.removeItem(LEONARDO_LOCAL_STORAGE_KEY);
    setApiKeyState(null);
  }, []);

  const hasApiKeys = useCallback((): boolean => {
    return !!apiKeys;
  }, [apiKeys]);

  return {
    getApiKeys,
    setApiKeys,
    clearApiKeys,
    hasApiKeys,
  };
};
