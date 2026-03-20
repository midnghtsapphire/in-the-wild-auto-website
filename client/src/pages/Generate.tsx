import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { trpc } from "@/lib/trpc";
import { Loader2, Rocket, Code, Database, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Generate Page - The core of InTheWild
 * Simple: prompt input + generate button
 * Fast: instant full-stack generation
 */
export default function Generate() {
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");

  const generateMutation = trpc.generation.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Project "${data.projectName}" generated successfully!`);
      // Redirect to project view
      window.location.href = `/project/${data.projectId}`;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate project");
    },
  });

  const usageQuery = trpc.billing.getUsage.useQuery();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <Loader2 className="w-12 h-12 animate-spin text-green-400" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/";
    return null;
  }

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description of your app");
      return;
    }

    generateMutation.mutate({
      prompt: prompt.trim(),
      projectName: projectName.trim() || undefined,
    });
  };

  const isGenerating = generateMutation.isPending;
  const tokensUsed = usageQuery.data?.tokensUsed || 0;
  const monthlyLimit = usageQuery.data?.monthlyLimit || 50000;
  const percentageUsed = usageQuery.data?.percentageUsed || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-green-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <Logo />
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                My Projects
              </Button>
            </Link>
            <div className="text-sm text-slate-400">
              {user.name || user.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Token Usage */}
        <Card className="bg-black/40 border-purple-500/20 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Token Usage This Month</div>
              <div className="text-2xl font-bold text-white">
                {tokensUsed.toLocaleString()} / {monthlyLimit.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">{usageQuery.data?.tier || "free"} tier</div>
              <div className="text-lg font-semibold text-green-400">
                {percentageUsed.toFixed(1)}% used
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </Card>

        {/* Generation Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Generate Full-Stack App</h2>
            <p className="text-slate-400">
              Describe your app and we'll generate the complete stack: frontend, backend, database, and deployment.
            </p>
          </div>

          {/* Project Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name (optional)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-app"
              className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              disabled={isGenerating}
            />
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe Your App
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A todo app with user authentication, categories, and due dates. Users can create, edit, and delete tasks. Include a dashboard showing task statistics."
              className="min-h-[200px] bg-black/40 border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-500"
              disabled={isGenerating}
            />
            <div className="mt-2 text-sm text-slate-400">
              Be specific about features, data models, and user flows for best results.
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Full Stack...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Generate Complete App
              </>
            )}
          </Button>

          {/* What Gets Generated */}
          <Card className="bg-black/40 border-green-500/20 p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-4">What Gets Generated:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Frontend</div>
                  <div className="text-sm text-slate-400">React components, routing, UI</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Backend</div>
                  <div className="text-sm text-slate-400">Express routes, controllers, middleware</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Database</div>
                  <div className="text-sm text-slate-400">Schema, migrations, models</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Deployment</div>
                  <div className="text-sm text-slate-400">Docker, env config, hosting</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
