"use client";

import { useState, useEffect } from "react";
import { ArweaveWalletKit, ConnectButton } from "arweave-wallet-kit";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { FileText, Download, Tag, Globe, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Dataset {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  size: string;
  fileType: string;
  category: string;
  useCase: string;
  ardriveLink: string;
  license: string;
  tags: string[];
  owner: string;
  timestamp: number;
  downloads: number;
}

const placeholderDatasets: Dataset[] = [
  {
    id: "1",
    name: "Common Crawl Web Dataset",
    description:
      "A massive web crawl dataset with over 100 billion tokens, perfect for training large language models and web analysis tasks.",
    itemCount: 100_000_000,
    size: "1.2 TB",
    fileType: "JSON/TXT",
    category: "Text",
    useCase: "Language Model Training, Web Analysis",
    ardriveLink: "https://ardrive.io/dataset1",
    license: "CC-BY-4.0",
    tags: ["web-crawl", "nlp", "text-corpus"],
    owner: "0x123...abc",
    timestamp: Date.now() - 1000000,
    downloads: 1520,
  },
  {
    id: "2",
    name: "ImageNet-1K",
    description:
      "A large-scale image dataset with 1000 object categories, widely used for computer vision tasks and model training.",
    itemCount: 1_000_000,
    size: "150 GB",
    fileType: "JPEG",
    category: "Images",
    useCase: "Image Classification, Object Detection",
    ardriveLink: "https://ardrive.io/dataset2",
    license: "Apache 2.0",
    tags: ["computer-vision", "classification", "images"],
    owner: "0x456...def",
    timestamp: Date.now() - 2000000,
    downloads: 2340,
  },
  {
    id: "3",
    name: "LibriSpeech Audio Dataset",
    description:
      "High-quality audio dataset containing 1000 hours of English speech, perfect for speech recognition models.",
    itemCount: 250_000,
    size: "60 GB",
    fileType: "WAV/MP3",
    category: "Audio",
    useCase: "Speech Recognition, Audio Processing",
    ardriveLink: "https://ardrive.io/dataset3",
    license: "MIT",
    tags: ["speech", "audio", "english"],
    owner: "0x789...ghi",
    timestamp: Date.now() - 3000000,
    downloads: 890,
  },
];

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>(placeholderDatasets);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const AO_PROCESS = "EcOnTx9f5fjCXd82ujUiSucCfDlx_IvggLE5LJpCQ8g";

  const categories = [
    "Text",
    "Images",
    "Audio",
    "Video",
    "Multimodal",
    "Structured Data",
  ];

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDatasets(placeholderDatasets);
    setIsLoading(false);
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || dataset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (datasetId: string) => {
    try {
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "UpdateDatasetDownloads" },
          { name: "datasetId", value: datasetId },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      await result({
        message: response,
        process: AO_PROCESS,
      });

      await fetchDatasets();
    } catch (error) {
      console.error("Error updating downloads:", error);
    }
  };

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
                  All Datasets
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
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">
                  Datasets (Powered by ardrive)
                </h1>
                <p className="text-white/60 mt-1">
                  Browse and download datasets for your AI models
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="bg-white/[0.02] border border-white/5 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {dataset.name}
                          </h3>
                          <p className="text-white/60 mt-1">
                            {dataset.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-white/5">
                          {dataset.category}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/40 text-sm">Items</p>
                          <p className="text-white font-medium">
                            {dataset.itemCount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/40 text-sm">Size</p>
                          <p className="text-white font-medium">
                            {dataset.size}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/40 text-sm">Downloads</p>
                          <p className="text-white font-medium">
                            {dataset.downloads.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white/60">
                          <FileText className="h-4 w-4" />
                          <span>File Type: {dataset.fileType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                          <Globe className="h-4 w-4" />
                          <span>License: {dataset.license}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                          <Tag className="h-4 w-4" />
                          <div className="flex flex-wrap gap-2">
                            {dataset.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="bg-white/5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-white/40">
                          Added{" "}
                          {new Date(dataset.timestamp).toLocaleDateString()}
                        </div>
                        <Button
                          onClick={() => {
                            window.open(dataset.ardriveLink, "_blank");
                            handleDownload(dataset.id);
                          }}
                          className="bg-indigo-500 hover:bg-indigo-600"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Dataset
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
    </div>
  );
}