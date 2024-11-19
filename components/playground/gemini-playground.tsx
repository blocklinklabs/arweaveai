"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiPlaygroundProps {
  apiKey: string;
}

export function GeminiPlayground({ apiKey }: GeminiPlaygroundProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey) {
      alert("Please enter your Gemini API key first");
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: temperature,
        },
      });

      const response = await result.response;
      setResponse(response.text());
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error occurred while generating response");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Temperature: {temperature}
        </label>
        <Slider
          value={[temperature]}
          onValueChange={(value) => setTemperature(value[0])}
          min={0}
          max={1}
          step={0.1}
        />
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        rows={4}
      />

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </Button>

      {response && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Response:</h3>
          <div className="bg-secondary p-4 rounded-lg whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
