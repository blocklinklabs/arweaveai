import Link from "next/link";
import { Logo } from "./logo";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#030712] px-6">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/5 backdrop-blur-lg bg-black/20">
          <nav className="container mx-auto px-8 py-6">
            <Link href="/">
              <Logo />
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-8">
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full" />
              <h1 className="relative text-5xl md:text-7xl font-bold text-white">
                {title}
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-white/60">
              This feature is coming soon
            </p>

            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />

            <p className="text-white/40 max-w-md">
              We're working hard to bring you an amazing experience. Stay tuned
              for updates!
            </p>

            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2 mt-8 group"
            >
              <svg
                className="w-4 h-4 transform transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
