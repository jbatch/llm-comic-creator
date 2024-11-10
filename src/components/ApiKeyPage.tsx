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

const LOCAL_STORAGE_KEY = "openai-api-key";

const ApiKeyPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
    setIsSaved(true);
  };

  const handleClear = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setApiKey("");
    setIsSaved(false);
    setShowKey(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription>
            Enter your OpenAI API key to use the story generation features. Your
            key will be stored securely in your browser's local storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!apiKey}>
                Save API Key
              </Button>
              {isSaved && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear Saved Key
                </Button>
              )}
            </div>
          </form>

          {isSaved && (
            <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>
                API key is saved and ready to use
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyPage;
