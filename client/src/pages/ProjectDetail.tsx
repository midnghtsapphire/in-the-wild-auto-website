import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import {
  Loader2, ArrowLeft, Rocket, Code, Database, Smartphone, ExternalLink,
  CheckCircle2, AlertCircle, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-slate-800/60 px-4 py-2 rounded-t-lg border border-slate-700/50">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={copy}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-slate-900/80 border border-t-0 border-slate-700/50 rounded-b-lg p-4 overflow-auto max-h-[500px] text-sm text-slate-200 font-mono whitespace-pre-wrap break-all">
        {code || "// No code generated yet"}
      </pre>
    </div>
  );
}

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id ? parseInt(params.id, 10) : null;

  const { user, loading: authLoading } = useAuth();
  const [appName, setAppName] = useState("");
  const [packageName, setPackageName] = useState("");

  const projectQuery = trpc.generation.getProject.useQuery(
    { projectId: projectId! },
    { enabled: projectId != null }
  );

  const deployMutation = trpc.generation.deploy.useMutation({
    onSuccess: (data) => {
      toast.success("Deployment started! Your app will be live shortly.");
      if (data.deploymentUrl) {
        window.open(data.deploymentUrl, "_blank");
      }
    },
    onError: (err) => toast.error(err.message || "Deployment failed"),
  });

  const mobileGenMutation = trpc.generation.generateMobileApp.useMutation({
    onSuccess: () => toast.success("React Native code generated! Check the Mobile App tab."),
    onError: (err) => toast.error(err.message || "Mobile app generation failed"),
  });

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

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <Card className="bg-black/40 border-red-500/20 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg">Invalid project ID</p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4 border-purple-500/50 text-purple-300">
              Back to Projects
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const project = projectQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-green-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <a className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">My Projects</span>
              </a>
            </Link>
            <div className="w-px h-6 bg-slate-700" />
            <Logo size="sm" />
          </div>
          {project?.deployUrl ? (
            <a href={project.deployUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live
              </Button>
            </a>
          ) : (
            <Button
              size="sm"
              onClick={() => deployMutation.mutate({ projectId })}
              disabled={deployMutation.isPending || !project}
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
            >
              {deployMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              Deploy
            </Button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {projectQuery.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-green-400" />
          </div>
        ) : !project ? (
          <Card className="bg-black/40 border-red-500/20 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">Project not found</p>
          </Card>
        ) : (
          <>
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{project.name}</h2>
                <Badge className={`text-sm border ${
                  project.status === "deployed"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : project.status === "ready"
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : project.status === "failed"
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                }`}>
                  {project.status === "deployed" ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : project.status === "failed" ? (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  ) : null}
                  {project.status}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm max-w-3xl">{project.prompt}</p>
            </div>

            {/* Code Tabs */}
            <Tabs defaultValue="frontend" className="space-y-4">
              <TabsList className="bg-black/40 border border-purple-500/20 p-1">
                <TabsTrigger value="frontend" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  <Code className="w-4 h-4 mr-2" />
                  Frontend
                </TabsTrigger>
                <TabsTrigger value="backend" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  <Code className="w-4 h-4 mr-2" />
                  Backend
                </TabsTrigger>
                <TabsTrigger value="database" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="mobile" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile App
                </TabsTrigger>
              </TabsList>

              <TabsContent value="frontend" className="space-y-4">
                <p className="text-slate-400 text-sm">Generated HTML/CSS/JS for the frontend</p>
                <CodeBlock code={project.generatedHtml || ""} language="html" />
              </TabsContent>

              <TabsContent value="backend" className="space-y-4">
                <p className="text-slate-400 text-sm">Express.js backend routes and controllers</p>
                {project.generatedJs ? (
                  <CodeBlock code={project.generatedJs} language="typescript" />
                ) : (
                  <Card className="bg-black/40 border-purple-500/20 p-8 text-center text-slate-400">
                    Backend code is generated separately and stored via the deployment pipeline.
                    Deploy your project to view the full backend code.
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="database" className="space-y-4">
                <p className="text-slate-400 text-sm">Database schema and migration files</p>
                {project.generatedCss ? (
                  <CodeBlock code={project.generatedCss} language="sql" />
                ) : (
                  <Card className="bg-black/40 border-purple-500/20 p-8 text-center text-slate-400">
                    Database schema is generated and stored alongside the deployment.
                    Deploy your project to view the generated schema.
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="mobile" className="space-y-6">
                {mobileGenMutation.data ? (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-sm">React Native code generated from your project</p>
                    <CodeBlock code={mobileGenMutation.data.reactNativeCode} language="typescript (React Native)" />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Android Configuration</p>
                        <CodeBlock code={mobileGenMutation.data.androidConfig} language="gradle" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-2">iOS Configuration</p>
                        <CodeBlock code={mobileGenMutation.data.iosConfig} language="ruby (Podfile)" />
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Build Instructions</p>
                      <CodeBlock code={mobileGenMutation.data.buildInstructions} language="bash" />
                    </div>
                  </div>
                ) : (
                  <Card className="bg-black/40 border-purple-500/20 p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
                      <Smartphone className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Convert to Mobile App</h3>
                      <p className="text-slate-400 text-sm max-w-md mx-auto">
                        Generate a React Native mobile app from this project. Works on iOS and Android.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">App Name</label>
                        <input
                          type="text"
                          value={appName}
                          onChange={e => setAppName(e.target.value)}
                          placeholder="MyApp"
                          className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                          disabled={mobileGenMutation.isPending}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={packageName}
                          onChange={e => setPackageName(e.target.value)}
                          placeholder="com.example.myapp"
                          className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                          disabled={mobileGenMutation.isPending}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        mobileGenMutation.mutate({
                          projectId,
                          appName: appName || project.name,
                      packageName: packageName || `com.inthewild.${project.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                        })
                      }
                      disabled={mobileGenMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                    >
                      {mobileGenMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating React Native code...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4 mr-2" />
                          Generate Mobile App
                        </>
                      )}
                    </Button>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
