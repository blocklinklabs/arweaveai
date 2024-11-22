"use client";
import { ArweaveWalletKit, ConnectButton } from "arweave-wallet-kit";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatGPTPlayground } from "@/components/playground/chatgpt-playground";
import { GeminiPlayground } from "@/components/playground/gemini-playground";
import { MemeGenerator } from "@/components/playground/meme-generator";
import { APIKeyManager } from "@/components/playground/api-key-manager";
import { Logo } from "@/components/ui/logo";

export default function PlaygroundPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    gemini: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#030712]">
      <ArweaveWalletKit
        config={{
          permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
          ensurePermissions: true,
        }}
      >
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Logo />
              <div className="w-[400px]">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models, datasets, users..."
                  className="bg-white/5 border-white/5 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/datasets"
                className="text-sm font-medium text-white/70 hover:text-white"
              >
                Datasets
              </Link>
              <Link
                href="/agents"
                className="text-sm font-medium text-white/70 hover:text-white"
              >
                Agents
              </Link>
              <Link
                href="/playground"
                className="text-sm font-medium text-white/70 hover:text-white"
              >
                Playground
              </Link>
              <Link
                href="/documentation"
                className="text-sm font-medium text-white/70 hover:text-white"
              >
                Docs
              </Link>
              <ConnectButton />
            </nav>
          </div>
        </header>

        <main className="container px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white mb-4">
                API Keys Setup
              </h3>
              <APIKeyManager apiKeys={apiKeys} setApiKeys={setApiKeys} />
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">AI Playground</h1>
                <p className="text-white/60 mt-1">
                  Experiment with different AI models and create amazing content
                </p>
              </div>

              <Tabs defaultValue="chatgpt" className="w-full">
                <TabsList className="mb-8 bg-white/[0.02] border border-white/5 p-1 rounded-lg">
                  <TabsTrigger
                    value="chatgpt"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                  >
                    ChatGPT
                  </TabsTrigger>
                  <TabsTrigger
                    value="gemini"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                  >
                    Gemini
                  </TabsTrigger>
                  <TabsTrigger
                    value="meme"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                  >
                    Meme Generator
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chatgpt">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      ChatGPT Playground
                    </h2>
                    <ChatGPTPlayground apiKey={apiKeys.openai} />
                  </div>
                </TabsContent>

                <TabsContent value="gemini">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Gemini Playground
                    </h2>
                    <GeminiPlayground apiKey={apiKeys.gemini} />
                  </div>
                </TabsContent>

                <TabsContent value="meme">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Meme Coin Logo Generator
                    </h2>
                    <MemeGenerator apiKey={apiKeys.gemini} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </ArweaveWalletKit>
    </div>
  );
}
