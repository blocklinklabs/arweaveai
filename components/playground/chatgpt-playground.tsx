"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatGPTPlaygroundProps {
  apiKey: string;
}

export function ChatGPTPlayground({ apiKey }: ChatGPTPlaygroundProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey) {
      alert("Please enter your OpenAI API key first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const data = await res.json();
      setResponse(data.choices[0].message.content);
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

      <div>
        <label className="text-sm font-medium">Max Tokens: {maxTokens}</label>
        <Slider
          value={[maxTokens]}
          onValueChange={(value) => setMaxTokens(value[0])}
          min={100}
          max={2000}
          step={100}
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
