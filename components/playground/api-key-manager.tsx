"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface APIKeyManagerProps {
  apiKeys: {
    openai: string;
    gemini: string;
  };
  setApiKeys: (keys: { openai: string; gemini: string }) => void;
}

export function APIKeyManager({ apiKeys, setApiKeys }: APIKeyManagerProps) {
  const [tempKeys, setTempKeys] = useState(apiKeys);

  const handleSave = () => {
    setApiKeys(tempKeys);
    localStorage.setItem("aiPlaygroundKeys", JSON.stringify(tempKeys));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">
          OpenAI API Key
        </label>
        <Input
          type="password"
          value={tempKeys.openai}
          onChange={(e) => setTempKeys({ ...tempKeys, openai: e.target.value })}
          placeholder="sk-..."
          className="bg-white/5 border-white/5 text-white placeholder:text-white/40"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">
          Google Gemini API Key
        </label>
        <Input
          type="password"
          value={tempKeys.gemini}
          onChange={(e) => setTempKeys({ ...tempKeys, gemini: e.target.value })}
          placeholder="Enter Gemini API key"
          className="bg-white/5 border-white/5 text-white placeholder:text-white/40"
        />
      </div>
      <Button
        onClick={handleSave}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        Save Keys
      </Button>
    </div>
  );
}
