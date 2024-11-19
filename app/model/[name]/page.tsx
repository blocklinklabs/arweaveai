"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArweaveWalletKit, ConnectButton } from "arweave-wallet-kit";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Database, ArrowLeft, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function ModelDetail() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    const modelData = searchParams.get("data");
    if (modelData) {
      setModel(JSON.parse(modelData));
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] px-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-[#030712] px-6 flex items-center justify-center flex-col gap-4">
        <div className="text-white text-xl">Model not found</div>
        <Link
          href="/"
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Models
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] px-6">
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
              </div>
              <ConnectButton />
            </nav>
          </header>

          <main className="container mx-auto px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/"
                className="inline-flex items-center text-white/60 hover:text-white mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Models
              </Link>

              <Card className="bg-white/[0.03] border-white/5">
                <CardHeader className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-3xl mb-4">
                        {model.name}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {model.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-sm px-3 py-1"
                    >
                      {model.modelType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div>
                    <h3 className="text-white/60 text-sm mb-2">Owner</h3>
                    <p className="text-white">{model.owner}</p>
                  </div>

                  <div>
                    <h3 className="text-white/60 text-sm mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.split(",").map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-sm bg-white/5 text-white/60"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {model.repo && (
                      <div>
                        <h3 className="text-white/60 text-sm mb-2">
                          Repository
                        </h3>
                        <a
                          href={model.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-indigo-400 flex items-center gap-2"
                        >
                          <GitBranch className="w-4 h-4" />
                          View Repository
                        </a>
                      </div>
                    )}
                    {model.dataset && (
                      <div>
                        <h3 className="text-white/60 text-sm mb-2">Dataset</h3>
                        <a
                          href={model.dataset}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-indigo-400 flex items-center gap-2"
                        >
                          <Database className="w-4 h-4" />
                          View Dataset
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </ArweaveWalletKit>
      </div>
    </div>
  );
}
