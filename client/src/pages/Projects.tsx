import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, Zap, Plus, FolderOpen, Rocket, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  generating: { label: "Generating", icon: Loader2, className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  verifying: { label: "Verifying", icon: Loader2, className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  ready: { label: "Ready", icon: CheckCircle2, className: "bg-green-500/20 text-green-300 border-green-500/30" },
  deployed: { label: "Deployed", icon: Rocket, className: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  failed: { label: "Failed", icon: AlertCircle, className: "bg-red-500/20 text-red-300 border-red-500/30" },
} as const;

export default function Projects() {
  const { user, loading: authLoading } = useAuth();
  const projectsQuery = trpc.generation.listProjects.useQuery();

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

  const projects = projectsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-green-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                InTheWild
              </h1>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/generate">
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Billing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Projects</h2>
            <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""} generated</p>
          </div>
        </div>

        {projectsQuery.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-green-400" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-black/40 border-purple-500/20 p-16 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-slate-400">Generate your first full-stack app to see it here.</p>
            </div>
            <Link href="/generate">
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Generate First Project
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => {
              const statusKey = project.status as keyof typeof STATUS_CONFIG;
              const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.ready;
              const StatusIcon = status.icon;

              return (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <a className="block">
                    <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/50 transition-all p-6 cursor-pointer group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                              {project.name}
                            </h3>
                            <Badge className={`text-xs border ${status.className} flex-shrink-0`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2 mb-3">{project.prompt}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                            {project.deployUrl && (
                              <a
                                href={project.deployUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-green-400 hover:text-green-300"
                                onClick={e => e.stopPropagation()}
                              >
                                <Rocket className="w-3 h-3" />
                                Live
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
