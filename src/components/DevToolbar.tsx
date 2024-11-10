import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { openAICache } from "../services/cache";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DevToolbar: React.FC = () => {
  const [skipCache, setSkipCache] = useState(false);

  useEffect(() => {
    // Initialize skip cache state from localStorage
    setSkipCache(openAICache.shouldSkipCache());
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  const handleSkipCacheChange = (checked: boolean) => {
    setSkipCache(checked);
    openAICache.setSkipCache(checked);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t p-2 flex justify-between items-center">
      <div className="flex items-center space-x-4 px-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="skip-cache"
            checked={skipCache}
            onCheckedChange={handleSkipCacheChange}
          />
          <Label htmlFor="skip-cache">Skip Cache</Label>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            openAICache.clear();
            window.location.reload();
          }}
        >
          Clear Cache
        </Button>
      </div>
    </div>
  );
};

export default DevToolbar;
