import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key } from "lucide-react";

const OPENAI_LOCAL_STORAGE_KEY = "openai-api-key";
const LEONARDO_LOCAL_STORAGE_KEY = "leonardo-api-key";

const ApiKeyPage = () => {
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [leonardoApiKey, setLeonardoApiKey] = useState("");
  const [showLeonardoKey, setShowLeonardoKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedOpenAiKey = localStorage.getItem(OPENAI_LOCAL_STORAGE_KEY);
    const savedLeonardoKey = localStorage.getItem(LEONARDO_LOCAL_STORAGE_KEY);
    if (savedOpenAiKey) {
      setOpenAiApiKey(savedOpenAiKey);
    }
    if (savedLeonardoKey) {
      setLeonardoApiKey(savedLeonardoKey);
    }
    setIsSaved(savedOpenAiKey != null && savedLeonardoKey != null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(OPENAI_LOCAL_STORAGE_KEY, openAiApiKey);
    localStorage.setItem(LEONARDO_LOCAL_STORAGE_KEY, leonardoApiKey);
    setIsSaved(true);
  };

  const handleClear = () => {
    localStorage.removeItem(OPENAI_LOCAL_STORAGE_KEY);
    localStorage.removeItem(LEONARDO_LOCAL_STORAGE_KEY);
    setOpenAiApiKey("");
    setLeonardoApiKey("");
    setIsSaved(false);
    setShowOpenAiKey(false);
    setShowLeonardoKey(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Enter your OpenAI and Leonardo API key to use the story generation
            features. Your key will be stored securely in your browser's local
            storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              OpenAI
              <Input
                type={showOpenAiKey ? "text" : "password"}
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                className="absolute right-3 top-1/2 translate-y-1/3 text-gray-500 hover:text-gray-700"
              >
                {showOpenAiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="relative">
              Leonardo
              <Input
                type={showLeonardoKey ? "text" : "password"}
                value={leonardoApiKey}
                onChange={(e) => setLeonardoApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowLeonardoKey(!showOpenAiKey)}
                className="absolute right-3 top-1/2 translate-y-1/3 text-gray-500 hover:text-gray-700"
              >
                {showLeonardoKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!openAiApiKey}>
                Save API Keys
              </Button>
              {isSaved && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear Saved Keys
                </Button>
              )}
            </div>
          </form>

          {isSaved && (
            <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>
                API keys are saved and ready to use
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyPage;
