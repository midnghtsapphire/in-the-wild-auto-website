import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getLoginUrl } from "@/const";
import { Code, Database, Rocket, CheckCircle2 } from "lucide-react";

/**
 * InTheWild Landing Page
 * LEAN & FAST - No bloat, just the core message:
 * We build COMPLETE full-stack apps (not just landing pages like Lovable)
 */
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (user) {
    // Redirect to dashboard if logged in
    window.location.href = "/generate";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-green-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <a href={getLoginUrl()}>
            <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
              Sign In
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-4">
              The Lovable Killer
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Full-Stack From{" "}
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Soup To Nuts
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Lovable builds pretty landing pages. <span className="text-green-400 font-semibold">We build complete applications</span> — real backends, real databases, real deployment. In minutes.
            </p>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-8 py-6 text-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Start Building Now
              </Button>
            </a>
          </div>

          {/* Key Differentiators */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-purple-300">Real Backends</h3>
              <p className="text-slate-400 text-sm">
                Express.js routes, controllers, middleware — not templates, actual working code
              </p>
            </div>

            <div className="bg-black/30 border border-green-500/20 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-green-300">Real Databases</h3>
              <p className="text-slate-400 text-sm">
                Schema generation, migrations, models — complete data layer, not just mockups
              </p>
            </div>

            <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-green-300 bg-clip-text text-transparent">
                Instant Deploy
              </h3>
              <p className="text-slate-400 text-sm">
                Live in minutes, not hours — complete with hosting, database, and environment config
              </p>
            </div>
          </div>

          {/* What You Get */}
          <div className="mt-20 bg-black/40 border border-purple-500/20 rounded-xl p-8 text-left">
            <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              What You Actually Get
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Complete React frontend with components",
                "Express.js backend with API routes",
                "Database schema & migrations",
                "Authentication & authorization",
                "Error handling & validation",
                "Environment configuration",
                "Docker deployment ready",
                "GitHub repo with all code",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Teaser */}
          <div className="mt-16 space-y-4">
            <h3 className="text-2xl font-bold">Start Free</h3>
            <p className="text-slate-400">
              50,000 tokens/month free • 2 uncensored LLM models • No credit card required
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                Get Started Free
              </Button>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-800/30 bg-black/20 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p>InTheWild © 2026 • Full-Stack AI Website Generator</p>
          <p className="mt-2 text-xs text-slate-500">
            Built with OpenRouter • Powered by uncensored LLMs
          </p>
        </div>
      </footer>
    </div>
  );
}
