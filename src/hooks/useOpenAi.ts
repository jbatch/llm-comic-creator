import { useCallback } from "react";
import { useApiKey } from "./useApiKey";
import { OpenAIService } from "@/services/openai";
import { useNavigate } from "react-router-dom";

export const useOpenAi = () => {
  const { getApiKeys } = useApiKey();
  const navigate = useNavigate();

  const getOpenAiService = useCallback(() => {
    const apiKey = getApiKeys()?.openAi;
    if (!apiKey) {
      navigate("/settings");
      return null;
    }
    return new OpenAIService(apiKey);
  }, [getApiKeys, navigate]);

  return {
    getOpenAiService,
  };
};
