"use client";

import { useState, useEffect } from "react";
import { ArweaveWalletKit, ConnectButton } from "arweave-wallet-kit";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Bot, Download, Tag, MessageSquare, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Agent {
  name: string;
  description: string;
  owner: string;
  documents: string[];
  model: string;
  type: string;
  created: number;
  metrics: {
    interactions: number;
    likes: number;
  };
}

const placeholderAgents: Agent[] = [
  //   {
  //     name: "ArweaveKit Docs Assistant",
  //     description:
  //       "AI assistant trained on ArweaveKit documentation to help developers with integration questions.",
  //     owner: "xyz123...",
  //     documents: ["https://docs.arweavekit.com"],
  //     model: "gpt-4",
  //     type: "documentation",
  //     created: Date.now() - 1000000,
  //     metrics: {
  //       interactions: 156,
  //       likes: 23,
  //     },
  //   },
  //   {
  //     name: "Permaweb Expert",
  //     description:
  //       "Your guide to understanding permanent storage on Arweave and the permaweb ecosystem.",
  //     owner: "abc456...",
  //     documents: ["https://arwiki.wiki"],
  //     model: "gpt-4",
  //     type: "education",
  //     created: Date.now() - 2000000,
  //     metrics: {
  //       interactions: 89,
  //       likes: 12,
  //     },
  //   },
];

interface CreateAgentForm {
  name: string;
  description: string;
  documents: string;
  model: string;
  type: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(placeholderAgents);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const AO_PROCESS = "OLa6vFiZacT4KxDwbqDdA1zU6fc_QyQYkhqB52tiWbA";
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateAgentForm>({
    name: "",
    description: "",
    documents: "",
    model: "gpt-4",
    type: "Documentation",
  });
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const categories = [
    "Documentation",
    "Education",
    "Support",
    "Development",
    "Research",
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await message({
        process: AO_PROCESS,
        tags: [{ name: "Action", value: "GetAgents" }],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      if (r?.Messages?.[0]?.Data) {
        // Parse the Data string into an object
        const agentData = JSON.parse(r.Messages[0].Data);

        // Convert the object into an array of agents
        const agentsArray = Object.entries(agentData).map(
          ([key, value]: [string, any]) => ({
            ...value,
            name: value.name || key,
          })
        );

        setAgents(agentsArray);
      } else {
        setAgents([]);
      }

      console.log("Processed agents:", agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent?.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      agent.type.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await message({
        process: AO_PROCESS as string,
        tags: [
          { name: "Action", value: "RegisterAgent" },
          { name: "name", value: formData.name },
          { name: "description", value: formData.description },
          { name: "documents", value: formData.documents },
          { name: "model", value: formData.model },
          { name: "type", value: formData.type },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      await result({
        message: response,
        process: AO_PROCESS as string,
      });

      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        documents: "",
        model: "gpt-4",
        type: "Documentation",
      });
      await fetchAgents();
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChat = async (message: string, agent: Agent) => {
    if (!message.trim()) return;

    setChatState((prev) => ({
      ...prev,
      isLoading: true,
      messages: [...prev.messages, { role: "user", content: message }],
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          documents: agent.documents,
          history: chatState.messages,
        }),
      });

      const data = await response.json();

      setChatState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: data.response },
        ],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error in chat:", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const createAgentDialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-indigo-500 hover:bg-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#030712] border-white/5 text-white">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-semibold">
            Create New Agent
          </DialogTitle>
          <DialogDescription className="text-white/60 mt-1.5">
            Create a new AI agent by providing the required information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateAgent} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-white">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ArweaveKit Assistant"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-white"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what your agent does..."
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="documents"
                className="text-sm font-medium text-white"
              >
                Documents (URLs, one per line)
              </Label>
              <Textarea
                id="documents"
                value={formData.documents}
                onChange={(e) =>
                  setFormData({ ...formData, documents: e.target.value })
                }
                placeholder="https://docs.example.com&#10;https://another-doc.com"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="model"
                  className="text-sm font-medium text-white"
                >
                  Model
                </Label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="mt-1.5 w-full bg-white/5 border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div>
                <Label
                  htmlFor="type"
                  className="text-sm font-medium text-white"
                >
                  Type
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1.5 w-full bg-white/5 border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const chatSheet = (
    <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] bg-[#030712] border-white/5"
      >
        <SheetHeader>
          <SheetTitle className="text-white">
            Chat with {currentAgent?.name}
          </SheetTitle>
          <SheetDescription className="text-white/60">
            This agent is trained on: {currentAgent?.documents}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {chatState.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatState.isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-lg px-4 py-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "message"
              ) as HTMLInputElement;
              if (currentAgent) {
                handleChat(input.value, currentAgent);
                input.value = "";
              }
            }}
            className="border-t border-white/5 p-4"
          >
            <div className="flex gap-2">
              <Input
                name="message"
                placeholder="Type your message..."
                className="bg-white/5 border-white/5 text-white"
              />
              <Button type="submit" disabled={chatState.isLoading}>
                Send
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );

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
                  placeholder="Search agents..."
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
                className="text-sm font-medium text-white hover:text-white"
              >
                Agents
              </Link>
              <Link
                href="/playground"
                className="text-sm font-medium text-white/70 hover:text-white"
              >
                Playground
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
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                    selectedCategory === "all"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  All Agents
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                      selectedCategory === category
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-8">{createAgentDialog}</div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">AI Agents</h1>
                <p className="text-white/60 mt-1">
                  Interact with AI agents trained on specific documentation and
                  datasets
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredAgents.map((agent: any) => (
                    <div
                      key={agent.name}
                      className="bg-white/[0.02] border border-white/5 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Bot className="h-8 w-8 text-indigo-400" />
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {agent.name}
                            </h3>
                            <p className="text-white/60 mt-1">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/5">
                          {agent.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/40 text-sm">Model</p>
                          <p className="text-white font-medium">
                            {agent.model}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/40 text-sm">Interactions</p>
                          <p className="text-white font-medium">
                            {agent.metrics.interactions.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/40 text-sm">Likes</p>
                          <p className="text-white font-medium">
                            {agent.metrics.likes.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-white/40">
                          Created {new Date(agent.created).toLocaleDateString()}
                        </div>
                        <Button
                          className="bg-indigo-500 hover:bg-indigo-600"
                          onClick={() => {
                            setCurrentAgent(agent);
                            setChatState({ messages: [], isLoading: false });
                            setIsChatOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat with Agent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </ArweaveWalletKit>
      {chatSheet}
    </div>
  );
}
