import { useCallback } from "react";
import { useApiKey } from "./useApiKey";
import { LeonardoService } from "@/services/leonardo";
import { useNavigate } from "react-router-dom";

export const useLeonardo = () => {
  const { getApiKeys } = useApiKey();
  const navigate = useNavigate();

  const getLeonardoService = useCallback(() => {
    const apiKey = getApiKeys()?.leonardo;
    if (!apiKey) {
      navigate("/settings");
      return null;
    }
    return new LeonardoService(apiKey);
  }, [getApiKeys, navigate]);

  return {
    getLeonardoService,
  };
};
