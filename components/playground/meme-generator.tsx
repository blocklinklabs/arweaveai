"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import OpenAI from "openai";

interface MemeGeneratorProps {
  apiKey: string;
}

export function MemeGenerator({ apiKey }: MemeGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(1024);

  const handleGenerate = async () => {
    if (!apiKey) {
      alert("Please enter your OpenAI API key first");
      return;
    }

    setLoading(true);
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from the server
      });

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a meme coin logo with the following description: ${prompt}. Make it creative, memorable, and suitable for a cryptocurrency project. The logo should be centered and isolated on a clean background.`,
        n: 1,
        size: `${size}x${size}`,
        quality: "standard",
        style: "vivid",
      });

      if (response.data[0]?.url) {
        setGeneratedImage(response.data[0].url);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating image");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-white/70">
          Image Size: {size}x{size}
        </label>
        <Slider
          value={[size]}
          onValueChange={(value) => setSize(value[0])}
          min={1024}
          max={1024}
          step={1024}
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">
          Logo Description
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your meme coin logo (e.g., 'A cute shiba inu wearing a space suit with laser eyes')"
          rows={4}
          className="bg-white/5 border-white/5 text-white placeholder:text-white/40"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        {loading ? "Generating..." : "Generate Logo"}
      </Button>

      {generatedImage && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-white/70">Generated Logo:</h3>
          <div className="bg-white/5 border border-white/5 rounded-lg p-4">
            <img
              src={generatedImage}
              alt="Generated meme coin logo"
              className="rounded-lg max-w-full h-auto mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
