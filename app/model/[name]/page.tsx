"use client";

import { useEffect, useState } from "react";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  ChevronLeft,
  Download,
  Star,
  GitFork,
  Github,
  Database,
  Calendar,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ModelDetail() {
  const searchParams = useSearchParams();
  const [model, setModel] = useState<any>(null);
  const [userInteractions, setUserInteractions] = useState<{
    likes: boolean;
    forks: boolean;
  }>({ likes: false, forks: false });
  const AO_PROCESS = "EcOnTx9f5fjCXd82ujUiSucCfDlx_IvggLE5LJpCQ8g";

  useEffect(() => {
    const modelData = searchParams.get("data");
    if (modelData) {
      setModel(JSON.parse(modelData));
      fetchUserInteractions(JSON.parse(modelData).name);
    }
  }, [searchParams]);

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

      if (r.Messages?.[0]?.Data) {
        const data = JSON.parse(r.Messages[0].Data);
        setUserInteractions(data.interactions);
      }
    } catch (error) {
      console.error("Error fetching user interactions:", error);
    }
  };

  const updateMetrics = async (metricType: "downloads" | "likes" | "forks") => {
    if (!window.arweaveWallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const response = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "UpdateMetrics" },
          { name: "modelId", value: model.name },
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

      if (r.Messages?.[0]?.Data) {
        const data = JSON.parse(r.Messages[0].Data);
        setModel((prev: any) => ({
          ...prev,
          metrics: data.metrics,
        }));
        await fetchUserInteractions(model.name);
        toast.success(`${metricType} updated successfully!`);
      }
    } catch (error) {
      console.error(`Error updating ${metricType}:`, error);
      toast.error(`Failed to update ${metricType}`);
    }
  };

  if (!model) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-white text-xl">Model not found</div>
      </div>
    );
  }

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
            </div>
          </div>
        </header>

        <main className="container px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-white/60 hover:text-white mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Models
          </Link>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {model.name}
                    </h1>
                    <p className="text-white/60">{model.description}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/5 text-white/80"
                  >
                    {model.modelType}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-white/60">
                  <button
                    onClick={() => {
                      if (model.downloadUrl) {
                        window.open(model.downloadUrl, "_blank");
                        updateMetrics("downloads");
                      } else {
                        toast.error("Download URL not available");
                      }
                    }}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {model.metrics?.downloads || 0} Downloads
                  </button>

                  <button
                    onClick={() => updateMetrics("likes")}
                    className={`flex items-center gap-2 transition-colors ${
                      userInteractions.likes
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "hover:text-white"
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        userInteractions.likes ? "fill-current" : ""
                      }`}
                    />
                    {model.metrics?.likes || 0} Likes
                  </button>

                  <button
                    onClick={() => updateMetrics("forks")}
                    className={`flex items-center gap-2 transition-colors ${
                      userInteractions.forks
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "hover:text-white"
                    }`}
                  >
                    <GitFork className="h-4 w-4" />
                    {model.metrics?.forks || 0} Forks
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  About this model
                </h2>
                <p className="text-white/80">{model.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Model Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/60">
                    <User className="w-4 h-4" />
                    <span>Owner: {model.owner}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Published:{" "}
                      {new Date(model.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {model.repo && (
                    <div className="flex items-center gap-3 text-white/60">
                      <Github className="w-4 h-4" />
                      <a
                        href={model.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        View Repository
                      </a>
                    </div>
                  )}
                  {model.dataset && (
                    <div className="flex items-center gap-3 text-white/60">
                      <Database className="w-4 h-4" />
                      <a
                        href={model.dataset}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        View Dataset
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
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
              </div>

              <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                Deploy Model
              </Button>
            </div>
          </div>
        </main>
      </ArweaveWalletKit>
    </div>
  );
}
