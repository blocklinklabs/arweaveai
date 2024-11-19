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
  AudioLines,
  Image,
  HelpCircle,
  FileText,
  Video,
  Shuffle,
  Layers,
  ImagePlus,
  Scan,
  SplitSquareHorizontal,
  Type,
  FileImage,
  ListFilter,
  Tags,
  Languages,
  Download,
  Star,
  GitFork,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import Link from "next/link";
import { Logo } from "../components/ui/logo";
import { toast, Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const taskCategories = {
  Multimodal: [
    { name: "Audio-Text-to-Text", icon: AudioLines },
    { name: "Image-Text-to-Text", icon: Image },
    { name: "Visual Question Answering", icon: HelpCircle },
    { name: "Document Question ", icon: FileText },
    { name: "Video-Text-to-Text", icon: Video },
    { name: "Any-to-Any", icon: Shuffle },
  ],
  "Computer Vision": [
    { name: "Depth Estimation", icon: Layers },
    { name: "Image Classification", icon: ImagePlus },
    { name: "Object Detection", icon: Scan },
    { name: "Image Segmentation", icon: SplitSquareHorizontal },
    { name: "Text-to-Image", icon: Type },
    { name: "Image-to-Text", icon: FileImage },
  ],
  NLP: [
    { name: "Text Generation", icon: Type },
    { name: "Text Classification", icon: ListFilter },
    { name: "Token Classification", icon: Tags },
    { name: "Translation", icon: Languages },
    { name: "Summarization", icon: FileText },
  ],
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    downloads: 0,
    likes: 0,
    forks: 0,
  });
  const [userInteractions, setUserInteractions] = useState<
    Record<string, { likes: boolean; forks: boolean }>
  >({});

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
          { name: "downloadUrl", value: downloadUrl },
          { name: "category", value: selectedCategory || "" },
          { name: "tags", value: tags },
          {
            name: "metrics",
            value: JSON.stringify({
              downloads: 0,
              likes: 0,
              forks: 0,
            }),
          },
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
      model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" ||
      (selectedType === "text" && model.modelType === "text-generation") ||
      (selectedType === "image" && model.modelType === "image-generation") ||
      (selectedType === "audio" && model.modelType === "audio");

    const matchesCategory =
      !selectedCategory || model.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // Filter models by category
    const categoryModels = models.filter(
      (model) => model.category === categoryName
    );
    if (categoryModels.length === 0) {
      toast.info(`No models found in ${categoryName} category`);
    }
  };

  const updateMetrics = async (
    modelId: string,
    metricType: "downloads" | "likes" | "forks"
  ) => {
    if (!window.arweaveWallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "UpdateMetrics" },
          { name: "modelId", value: modelId },
          { name: "metricType", value: metricType },
          {
            name: "userAddress",
            value: await window.arweaveWallet.getActiveAddress(),
          },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      if (r.status === "success") {
        await fetchModels(); // Refresh the models list
        toast.success(`${metricType} updated successfully!`);
      } else {
        throw new Error(r.message);
      }
    } catch (error) {
      console.error(`Error updating ${metricType}:`, error);
      toast.error(`Failed to update ${metricType}`);
    }
  };

  const fetchUserInteractions = async (modelId: string) => {
    if (!window.arweaveWallet) return;

    try {
      const userAddress = await window.arweaveWallet.getActiveAddress();
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "GetUserInteractions" },
          { name: "modelId", value: modelId },
          { name: "userAddress", value: userAddress },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const r = await result({
        message: response,
        process: AO_PROCESS,
      });

      if (r.status === "success") {
        setUserInteractions((prev) => ({
          ...prev,
          [modelId]: r.interactions,
        }));
      }
    } catch (error) {
      console.error("Error fetching user interactions:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <ArweaveWalletKit
        config={{
          permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
          appInfo: {
            name: "AI Model Registry",
            logo: "https://your-logo-url.png",
          },
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

        <div className="container flex gap-6 px-4 py-6">
          <div className="w-64 flex-shrink-0">
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <div className="space-y-6">
                {Object.entries(taskCategories).map(([category, tasks]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {tasks.map((task) => (
                        <button
                          key={task.name}
                          onClick={() => handleCategorySelect(task.name)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
                            ${
                              selectedCategory === task.name
                                ? "bg-white/10 text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <task.icon className="h-4 w-4" />
                          {task.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Models</h1>
                <span className="text-sm text-white/60">
                  {filteredModels.length.toLocaleString()} results
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/5 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text Generation</SelectItem>
                    <SelectItem value="image">Image Generation</SelectItem>
                    <SelectItem value="audio">Audio Processing</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Model
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredModels.map((model) => (
                <div
                  key={model.name}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex justify-between">
                    <Link
                      href={{
                        pathname: `/model/${encodeURIComponent(model.name)}`,
                        query: { data: JSON.stringify(model) },
                      }}
                      className="flex-1"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {model.name}
                          </h3>
                          <p className="mt-1 text-sm text-white/60">
                            {model.description}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-white/5 text-white/80"
                        >
                          {model.modelType}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {model.tags?.split(",").map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white/80"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {model.metrics?.downloads || 0} downloads
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {model.metrics?.likes || 0} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {model.metrics?.forks || 0} forks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ArweaveWalletKit>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add New Model</DialogTitle>
            <DialogDescription className="text-white/60">
              Register your AI model to the decentralized registry
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleModelSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Model Name</label>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="e.g., BERT-Base"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60">Model Type</label>
                <Select value={modelType} onValueChange={setModelType}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    <SelectItem value="text-generation">
                      Text Generation
                    </SelectItem>
                    <SelectItem value="image-generation">
                      Image Generation
                    </SelectItem>
                    <SelectItem value="audio">Audio Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Description</label>
              <Textarea
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                placeholder="Describe your model's capabilities and use cases..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">
                  GitHub Repository
                </label>
                <Input
                  value={modelRepo}
                  onChange={(e) => setModelRepo(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="https://github.com/..."
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60">Dataset URL</label>
                <Input
                  value={datasetUrl}
                  onChange={(e) => setDatasetUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="https://huggingface.co/datasets/..."
                  type="url"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="nlp, transformer, bert (comma separated)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Download URL (ArDrive)
              </label>
              <Input
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="https://ardrive.io/..."
                type="url"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Category</label>
              <Select
                value={selectedCategory || ""}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {Object.entries(taskCategories).map(([category, tasks]) =>
                    tasks.map((task) => (
                      <SelectItem key={task.name} value={task.name}>
                        {task.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Model"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
