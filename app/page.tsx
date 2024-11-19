"use client";

import { useState, useEffect } from "react";
import { ArweaveWalletKit, ConnectButton } from "arweave-wallet-kit";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Globe,
  Brain,
  Sparkles,
  GitBranch,
  Database,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Link from "next/link";
import { Logo } from "../components/ui/logo";
import { toast, Toaster } from "sonner";

export default function Home() {
  const AO_PROCESS = "EcOnTx9f5fjCXd82ujUiSucCfDlx_IvggLE5LJpCQ8g";

  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [models, setModels] = useState<any[]>([]);
  const [modelRepo, setModelRepo] = useState("");
  const [datasetUrl, setDatasetUrl] = useState("");
  const [modelType, setModelType] = useState("text-generation");
  const [arweaveDeployUrl, setArweaveDeployUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const CACHE_KEY = "cached_models";

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await message({
        process: AO_PROCESS,
        tags: [{ name: "Action", value: "GetModels" }],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      if (r?.Messages?.[0]?.Data) {
        const modelsData = JSON.parse(r.Messages[0].Data);
        const modelsArray = Object.entries(modelsData).map(
          ([key, value]: [string, any]) => ({
            ...value,
            name: value.name || key,
          })
        );
        setModels(modelsArray);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    getModels();
  }, []);

  const registerModel = async () => {
    try {
      setIsSubmitting(true);
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "RegisterModel" },
          { name: "name", value: modelName },
          { name: "description", value: modelDescription },
          { name: "modelType", value: modelType },
          { name: "repo", value: modelRepo },
          { name: "dataset", value: datasetUrl },
          { name: "deployment", value: arweaveDeployUrl },
          { name: "tags", value: tags },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      // Create new model object
      const newModel = {
        name: modelName,
        description: modelDescription,
        modelType: modelType,
        repo: modelRepo,
        dataset: datasetUrl,
        deployment: arweaveDeployUrl,
        tags: tags,
        owner: window.arweaveWallet?.getActiveAddress(),
        timestamp: Date.now(),
      };

      // Update local cache with new model
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cachedModels, timestamp } = JSON.parse(cached);
        const updatedModels = [...cachedModels, newModel];
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: updatedModels,
            timestamp,
          })
        );
        setModels(updatedModels);
      }

      // Clear form and show toast
      setModelName("");
      setModelDescription("");
      setModelRepo("");
      setDatasetUrl("");
      setArweaveDeployUrl("");
      setTags("");

      toast.success("Model registered successfully!", {
        description: `${modelName} has been added to the registry.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error registering model:", error);
      toast.error("Failed to register model", {
        description: "Please try again later.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerModel();
  };

  const getModels = async () => {
    try {
      setIsLoading(true);
      const response = await message({
        process: AO_PROCESS,
        tags: [{ name: "Action", value: "GetModels" }],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      console.log("Models fetched:", r);
      return r;
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    try {
      setIsLoading(true);
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "DeleteModel" },
          { name: "name", value: modelName },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      // Update local cache by removing the deleted model
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cachedModels, timestamp } = JSON.parse(cached);
        const updatedModels = cachedModels.filter(
          (model: any) => model.name !== modelName
        );
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: updatedModels,
            timestamp,
          })
        );
        setModels(updatedModels);
      }

      toast.success("Model deleted successfully!", {
        description: `${modelName} has been removed from the registry.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model", {
        description: "Please try again later.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByType = async (type: string) => {
    try {
      setIsLoading(true);
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "SearchModelsByType" },
          { name: "modelType", value: type },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      console.log("Models by type:", r);
      if (r && Object.keys(r).length > 0) {
        const modelsArray = Object.entries(r).map(([name, model]) => ({
          name,
          ...model,
        }));
        setModels(modelsArray);
      }
    } catch (error) {
      console.error("Error searching models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModels = models.filter((model: any) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" ||
      (selectedType === "text" && model.modelType === "text-generation") ||
      (selectedType === "image" && model.modelType === "image-generation") ||
      (selectedType === "audio" && model.modelType === "audio");

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#030712] px-6">
      <Toaster position="top-center" theme="dark" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-[1920px] mx-auto">
        <ArweaveWalletKit
          config={{
            permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION"],
            ensurePermissions: true,
          }}
        >
          <header className="border-b border-white/5 backdrop-blur-lg bg-black/20 sticky top-0 z-50">
            <nav className="container mx-auto px-8 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-14">
                <Link href="/">
                  <Logo />
                </Link>
                <div className="hidden md:flex items-center space-x-10">
                  <Link
                    href="/explore"
                    className="text-base text-white/60 hover:text-white transition-colors"
                  >
                    Explore
                  </Link>
                  <Link
                    href="/documentation"
                    className="text-base text-white/60 hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                  <Link
                    href="/community"
                    className="text-base text-white/60 hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </div>
              </div>
              <ConnectButton />
            </nav>
          </header>

          <main className="container mx-auto px-8 py-16">
            <div className="max-w-4xl mx-auto text-center mb-20 space-y-8">
              <h1 className="text-6xl font-bold text-white tracking-tight">
                Decentralized AI Model Registry
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Deploy, discover, and collaborate on AI models in a
                decentralized ecosystem powered by Arweave
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              <Tabs defaultValue="explore" className="space-y-10">
                <div className="flex justify-center">
                  <TabsList className="bg-white/5 p-1.5">
                    <TabsTrigger
                      value="explore"
                      className="text-base px-10 py-3 data-[state=active]:bg-white/10"
                    >
                      Explore Models
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="text-base px-10 py-3 data-[state=active]:bg-white/10"
                    >
                      Register Model
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="explore">
                  <div className="flex gap-6 mb-10">
                    <div className="relative flex-1">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models..."
                        className="bg-white/5 border-0 text-white placeholder:text-white/40 pl-12 h-12 text-base"
                      />
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger className="w-[200px] bg-white/5 border-0 text-white h-12 text-base">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="text">Text Generation</SelectItem>
                        <SelectItem value="image">Image Generation</SelectItem>
                        <SelectItem value="audio">Audio Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredModels.map((model: any, index) => (
                        <Link
                          href={{
                            pathname: `/model/${encodeURIComponent(
                              model.name
                            )}`,
                            query: { data: JSON.stringify(model) },
                          }}
                          key={index}
                        >
                          <Card className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all duration-300 hover:translate-y-[-2px]">
                            <CardHeader className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-white text-xl truncate">
                                    {model.name}
                                  </CardTitle>
                                  <CardDescription className="mt-3 text-white/60 line-clamp-2 text-base">
                                    {model.description}
                                  </CardDescription>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-sm px-3 py-1 whitespace-nowrap flex-shrink-0"
                                >
                                  {model.modelType}
                                </Badge>
                              </div>
                              <div className="mt-2 text-sm text-white/40">
                                Owner: {model.owner.slice(0, 8)}...
                                {model.owner.slice(-4)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {model.tags &&
                                  model.tags
                                    .split(",")
                                    .map((tag: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/60 hover:bg-white/10 transition-colors whitespace-nowrap"
                                      >
                                        {tag.trim()}
                                      </span>
                                    ))}
                              </div>
                            </CardContent>
                            <CardFooter className="border-t border-white/5">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex gap-4">
                                  {model.repo && (
                                    <a
                                      href={model.repo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white/40 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                      <GitBranch className="w-4 h-4" />
                                      <span className="text-sm">
                                        Repository
                                      </span>
                                    </a>
                                  )}
                                  {model.dataset && (
                                    <a
                                      href={model.dataset}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white/40 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                      <Database className="w-4 h-4" />
                                      <span className="text-sm">Dataset</span>
                                    </a>
                                  )}
                                </div>
                                {model.owner ===
                                  window.arweaveWallet?.getActiveAddress() && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteModel(model.name)
                                    }
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="register">
                  <Card className="max-w-3xl mx-auto bg-white/[0.03] border-white/5">
                    <CardHeader className="p-8">
                      <CardTitle className="text-white text-2xl">
                        Register New Model
                      </CardTitle>
                      <CardDescription className="text-base">
                        Share your AI model with the community
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <form onSubmit={handleModelSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm text-white/60">
                              Model Name
                            </label>
                            <Input
                              value={modelName}
                              onChange={(e) => setModelName(e.target.value)}
                              className="bg-white/5 border-0 text-white placeholder:text-white/40"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/60">
                              Model Type
                            </label>
                            <Select
                              value={modelType}
                              onValueChange={setModelType}
                            >
                              <SelectTrigger className="bg-white/5 border-0 text-white">
                                <SelectValue className="text-white" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800">
                                <SelectItem
                                  value="text-generation"
                                  className="text-white"
                                >
                                  Text Generation
                                </SelectItem>
                                <SelectItem
                                  value="image-generation"
                                  className="text-white"
                                >
                                  Image Generation
                                </SelectItem>
                                <SelectItem
                                  value="audio"
                                  className="text-white"
                                >
                                  Audio Processing
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-white/60">
                            Description
                          </label>
                          <Textarea
                            value={modelDescription}
                            onChange={(e) =>
                              setModelDescription(e.target.value)
                            }
                            className="bg-white/5 border-0 text-white placeholder:text-white/40 min-h-[100px]"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm text-white/60">
                              GitHub Repository
                            </label>
                            <Input
                              value={modelRepo}
                              onChange={(e) => setModelRepo(e.target.value)}
                              className="bg-white/5 border-0 text-white placeholder:text-white/40"
                              type="url"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/60">
                              Dataset URL
                            </label>
                            <Input
                              value={datasetUrl}
                              onChange={(e) => setDatasetUrl(e.target.value)}
                              className="bg-white/5 border-0 text-white placeholder:text-white/40"
                              type="url"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-white/60">Tags</label>
                          <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="bg-white/5 border-0 text-white placeholder:text-white/40"
                            placeholder="nlp, transformer, bert"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium h-12 text-base"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            "Register Model"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </ArweaveWalletKit>
      </div>
    </div>
  );
}
